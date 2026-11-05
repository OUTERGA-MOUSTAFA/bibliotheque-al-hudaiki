<?php

namespace Tests\Feature;

use App\Mail\ContactRequestMail;
use App\Models\Category;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SecurityAndPasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'lecteur', 'guard_name' => 'web']);
    }

    private function lecteur(array $attrs = []): User
    {
        $user = User::factory()->create($attrs + ['nom' => 'Test', 'prenom' => 'Lecteur', 'statut' => 'actif']);
        $user->assignRole('lecteur');
        return $user;
    }

    // ───────────── Routes Fortify désactivées ─────────────

    public function test_les_routes_web_de_fortify_n_existent_plus(): void
    {
        // Elles permettaient de créer un compte sans consentement 09-08 ni rôle lecteur
        $this->postJson('/register', [
            'name' => 'Intrus', 'email' => 'intrus@example.com',
            'password' => 'motdepasse1', 'password_confirmation' => 'motdepasse1',
        ])->assertNotFound();

        $this->postJson('/login', ['email' => 'x@example.com', 'password' => 'x'])->assertNotFound();
        $this->assertDatabaseMissing('users', ['email' => 'intrus@example.com']);
    }

    public function test_inscription_avec_un_email_deja_pris_en_majuscules(): void
    {
        $this->lecteur(['email' => 'sara@example.com']);

        $this->postJson('/api/register', [
            'nom' => 'Alaoui', 'prenom' => 'Sara', 'email' => 'SARA@example.com',
            'password' => 'motdepasse1', 'password_confirmation' => 'motdepasse1',
            'date_naissance' => now()->subYears(12)->toDateString(), 'telephone' => '0600000000',
            'consentement' => true,
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_un_majeur_sans_cin_recoit_une_erreur_sur_le_champ_cin(): void
    {
        $this->postJson('/api/register', [
            'nom' => 'Alaoui', 'prenom' => 'Omar', 'email' => 'omar@example.com',
            'password' => 'motdepasse1', 'password_confirmation' => 'motdepasse1',
            'date_naissance' => now()->subYears(30)->toDateString(), 'telephone' => '0600000000',
            'consentement' => true,
        ])->assertStatus(422)->assertJsonValidationErrors('cin');
    }

    // ───────────── Mot de passe oublié ─────────────

    public function test_lien_de_reinitialisation_envoye_vers_le_frontend(): void
    {
        Notification::fake();
        config(['app.frontend_url' => 'https://bibliotheque.test']);
        $user = $this->lecteur(['email' => 'sara@example.com']);

        // L'adresse est reconnue même avec des majuscules
        $this->postJson('/api/forgot-password', ['email' => 'Sara@Example.com', 'locale' => 'ar'])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            // fresh() : la demande a enregistré la langue « ar » sur le compte
            $url = $notification->toMail($user->fresh())->actionUrl;
            return str_starts_with($url, 'https://bibliotheque.test/ar/reinitialiser-mot-de-passe?token=');
        });
    }

    public function test_mot_de_passe_oublie_ne_revele_pas_si_le_compte_existe(): void
    {
        Notification::fake();

        $inconnu = $this->postJson('/api/forgot-password', ['email' => 'personne@example.com'])->assertOk();
        $this->lecteur(['email' => 'connu@example.com']);
        $connu = $this->postJson('/api/forgot-password', ['email' => 'connu@example.com'])->assertOk();

        $this->assertSame($inconnu->json('message'), $connu->json('message'));
    }

    public function test_compte_archive_ne_recoit_pas_de_lien(): void
    {
        Notification::fake();
        $user = $this->lecteur(['email' => 'archive@example.com', 'statut' => 'archive']);

        $this->postJson('/api/forgot-password', ['email' => 'archive@example.com'])->assertOk();

        Notification::assertNotSentTo($user, ResetPassword::class);
    }

    public function test_reinitialisation_change_le_mot_de_passe_et_ferme_les_sessions(): void
    {
        $user = $this->lecteur(['email' => 'sara@example.com']);
        $user->createToken('ancien');
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token, 'email' => 'sara@example.com',
            'password' => 'nouveau-mdp-1', 'password_confirmation' => 'nouveau-mdp-1',
        ])->assertOk();

        $this->assertSame(0, $user->tokens()->count());
        $this->postJson('/api/login', ['email' => 'sara@example.com', 'password' => 'nouveau-mdp-1'])
            ->assertOk()->assertJsonStructure(['token']);
    }

    public function test_reinitialisation_refusee_avec_un_token_invalide(): void
    {
        $this->lecteur(['email' => 'sara@example.com']);

        $this->postJson('/api/reset-password', [
            'token' => 'faux', 'email' => 'sara@example.com',
            'password' => 'nouveau-mdp-1', 'password_confirmation' => 'nouveau-mdp-1',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    // ───────────── Contact ─────────────

    public function test_message_de_contact_envoye_a_l_admin(): void
    {
        Mail::fake();
        config(['mail.admin_address' => 'admin@bibliotheque.test']);

        $this->postJson('/api/contact', [
            'nom' => 'Sara', 'email' => 'sara@example.com', 'sujet' => 'Horaires', 'message' => 'Bonjour',
        ])->assertCreated();

        Mail::assertSent(ContactRequestMail::class, fn($mail) =>
            $mail->hasTo('admin@bibliotheque.test') && $mail->hasReplyTo('sara@example.com'));
    }

    // ───────────── Catégories ─────────────

    public function test_admin_peut_reactiver_une_categorie_archivee(): void
    {
        $admin = User::factory()->create(['nom' => 'Admin', 'prenom' => 'A', 'statut' => 'actif']);
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);
        $categorie = Category::create(['nom' => 'Histoire', 'slug' => 'histoire', 'statut' => 'actif']);

        $this->postJson("/api/admin/categories/{$categorie->id}/archive")->assertOk();
        $this->getJson('/api/categories')->assertJsonCount(0);

        $this->postJson("/api/admin/categories/{$categorie->id}/restore")->assertOk();
        $this->getJson('/api/categories')->assertJsonCount(1);
    }

    public function test_un_lecteur_ne_peut_pas_gerer_les_categories(): void
    {
        Sanctum::actingAs($this->lecteur());

        $this->postJson('/api/admin/categories', ['nom' => 'Pirate'])->assertForbidden();
    }

    // ───────────── Tokens ─────────────

    public function test_les_tokens_expirent(): void
    {
        $this->assertGreaterThan(0, config('sanctum.expiration'));
    }
}
