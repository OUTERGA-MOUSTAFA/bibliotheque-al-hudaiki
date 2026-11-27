<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

// Chaque test rejoue une attaque d'un utilisateur malveillant et vérifie qu'elle échoue.
class AttackScenariosTest extends TestCase
{
    use RefreshDatabase;

    private int $ip = 1;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'lecteur', 'guard_name' => 'web']);
    }

    private function lecteur(array $attrs = []): User
    {
        $user = User::factory()->create($attrs + [
            'nom' => 'Test', 'prenom' => 'Lecteur', 'statut' => 'actif',
            'email' => 'victime@example.com', 'password' => Hash::make('BonMotDePasse1'),
        ]);
        $user->assignRole('lecteur');
        return $user;
    }

    // Chaque requête vient d'une nouvelle adresse IP (attaquant qui contourne la limite par IP)
    private function depuisNouvelleIp(): static
    {
        return $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.' . $this->ip++]);
    }

    private function admin(): User
    {
        $u = User::factory()->create(['nom' => 'A', 'prenom' => 'Admin', 'statut' => 'actif']);
        $u->assignRole('admin');
        return $u;
    }

    // ───────────── Force brute sur le mot de passe ─────────────

    public function test_force_brute_distribuee_bloque_le_compte_vise(): void
    {
        $this->lecteur();

        for ($i = 0; $i < 10; $i++) {
            $this->depuisNouvelleIp()->postJson('/api/login', [
                'email' => 'victime@example.com', 'password' => "essai{$i}",
            ])->assertStatus(422);
        }

        // 11e essai, même avec le BON mot de passe : le compte est temporairement protégé
        $this->depuisNouvelleIp()->postJson('/api/login', [
            'email' => 'VICTIME@example.com', 'password' => 'BonMotDePasse1',
        ])->assertStatus(429)->assertJsonValidationErrors('email');
    }

    public function test_email_inconnu_reponse_identique_sans_erreur_serveur(): void
    {
        $this->lecteur();

        $inconnu = $this->postJson('/api/login', ['email' => 'personne@example.com', 'password' => 'x'])
            ->assertStatus(422)->json('errors.email.0');
        $mauvaisMdp = $this->depuisNouvelleIp()->postJson('/api/login', ['email' => 'victime@example.com', 'password' => 'x'])
            ->assertStatus(422)->json('errors.email.0');

        $this->assertSame($inconnu, $mauvaisMdp);
    }

    // ───────────── Double authentification ─────────────

    public function test_code_2fa_devine_au_hasard_la_connexion_est_annulee(): void
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $this->lecteur([
            'two_factor_secret' => encrypt($secret),
            'two_factor_confirmed_at' => now(),
        ]);

        $challenge = $this->postJson('/api/login', [
            'email' => 'victime@example.com', 'password' => 'BonMotDePasse1',
        ])->assertOk()->json('challenge');

        for ($i = 0; $i < 5; $i++) {
            $this->depuisNouvelleIp()->postJson('/api/two-factor-challenge', [
                'challenge' => $challenge, 'code' => '000000',
            ])->assertStatus(422);
        }

        // Même le bon code ne marche plus : il faut recommencer depuis le mot de passe
        $this->depuisNouvelleIp()->postJson('/api/two-factor-challenge', [
            'challenge' => $challenge, 'code' => $google2fa->getCurrentOtp($secret),
        ])->assertStatus(422)->assertJsonMissingPath('token');
    }

    // ───────────── Vol de session ─────────────

    public function test_session_volee_ne_peut_pas_changer_l_email_sans_mot_de_passe(): void
    {
        $user = $this->lecteur();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withToken($token)->putJson('/api/profile', ['email' => 'pirate@example.com'])
            ->assertStatus(422)->assertJsonValidationErrors('current_password');
        $this->assertSame('victime@example.com', $user->fresh()->email);

        // Le vrai propriétaire, lui, peut le faire
        $this->withToken($token)->putJson('/api/profile', [
            'email' => 'nouvelle@example.com', 'current_password' => 'BonMotDePasse1',
        ])->assertOk();
        $this->assertSame('nouvelle@example.com', $user->fresh()->email);
    }

    public function test_changer_le_mot_de_passe_deconnecte_les_autres_appareils(): void
    {
        $user = $this->lecteur();
        $intrus = $user->createToken('auth')->plainTextToken;
        $moi = $user->createToken('auth')->plainTextToken;

        $this->withToken($moi)->putJson('/api/profile', [
            'current_password' => 'BonMotDePasse1',
            'password' => 'NouveauMotDePasse2', 'password_confirmation' => 'NouveauMotDePasse2',
        ])->assertOk();

        $this->assertSame(1, $user->tokens()->count());
        $this->app['auth']->forgetGuards();
        $this->withToken($intrus)->getJson('/api/me')->assertUnauthorized();
    }

    public function test_mot_de_passe_trop_faible_refuse(): void
    {
        $this->postJson('/api/register', [
            'nom' => 'Alaoui', 'prenom' => 'Sara', 'email' => 'sara@example.com',
            'password' => 'motdepasse', 'password_confirmation' => 'motdepasse',
            'date_naissance' => now()->subYears(12)->toDateString(), 'telephone' => '0600000000',
            'consentement' => true,
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    // ───────────── Élévation de privilèges ─────────────

    public function test_un_lecteur_ne_peut_pas_se_donner_le_role_admin(): void
    {
        $this->postJson('/api/register', [
            'nom' => 'Alaoui', 'prenom' => 'Sara', 'email' => 'sara@example.com',
            'password' => 'motdepasse1', 'password_confirmation' => 'motdepasse1',
            'date_naissance' => now()->subYears(12)->toDateString(), 'telephone' => '0600000000',
            'consentement' => true,
            // Champs ajoutés par l'attaquant
            'roles' => ['admin'], 'role' => 'admin', 'statut' => 'actif', 'is_admin' => true,
        ])->assertCreated()->assertJsonPath('roles', ['lecteur']);

        $victime = $this->admin();
        $token = User::where('email', 'sara@example.com')->first()->createToken('auth')->plainTextToken;
        $this->withToken($token)->getJson('/api/admin/users')->assertForbidden();
        $this->withToken($token)->deleteJson("/api/admin/users/{$victime->id}")->assertForbidden();
        $this->assertModelExists($victime);
    }

    public function test_un_lecteur_ne_peut_pas_supprimer_l_avis_d_un_autre(): void
    {
        $auteur = $this->lecteur();
        $book = \App\Models\Book::factory()->create();
        $avis = \App\Models\Review::create(['user_id' => $auteur->id, 'book_id' => $book->id, 'note' => 5]);

        $autre = $this->lecteur(['email' => 'autre@example.com']);
        $this->withToken($autre->createToken('auth')->plainTextToken)
            ->deleteJson("/api/reviews/{$avis->id}")->assertForbidden();
        $this->assertModelExists($avis);
    }

    // ───────────── Liens et entrées piégés ─────────────

    public function test_lien_du_hero_vers_un_autre_site_deguise_refuse(): void
    {
        $token = $this->admin()->createToken('auth')->plainTextToken;
        $base = ['image' => 'https://images.unsplash.com/photo-1', 'titre_fr' => 'Bienvenue'];

        foreach (['//evil.com', '/\\evil.com', 'javascript:alert(1)'] as $lien) {
            $this->withToken($token)->postJson('/api/admin/hero/slides', $base + ['lien' => $lien])
                ->assertStatus(422)->assertJsonValidationErrors('lien');
        }

        $this->withToken($token)->postJson('/api/admin/hero/slides', $base + ['lien' => '/catalogue'])
            ->assertCreated();
    }

    public function test_parametres_de_recherche_en_tableau_ne_font_pas_planter_l_api(): void
    {
        $this->getJson('/api/books?q[]=a&categorie[]=1&langue[]=ar')->assertOk();
    }

    // ───────────── En-têtes et limites ─────────────

    public function test_en_tetes_de_securite_et_limite_generale(): void
    {
        $this->getJson('/api/books')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-RateLimit-Limit', '300');
    }

    public function test_les_reponses_privees_ne_sont_pas_mises_en_cache(): void
    {
        $token = $this->lecteur()->createToken('auth')->plainTextToken;

        $cache = $this->withToken($token)->getJson('/api/me')->assertOk()->headers->get('Cache-Control');
        $this->assertStringContainsString('no-store', $cache);
    }
}
