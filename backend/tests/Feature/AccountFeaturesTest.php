<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\ContactRequest;
use App\Models\Loan;
use App\Models\Sponsor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Sanctum\Sanctum;
use PragmaRX\Google2FA\Google2FA;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AccountFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'lecteur', 'guard_name' => 'web']);
    }

    private function lecteur(): User
    {
        $user = User::factory()->create([
            'nom' => 'Test', 'prenom' => 'Lecteur', 'statut' => 'actif',
            'date_naissance' => now()->subYears(20),
        ]);
        $user->assignRole('lecteur');
        return $user;
    }

    private function admin(): User
    {
        $user = User::factory()->create(['nom' => 'Admin', 'prenom' => 'A', 'statut' => 'actif']);
        $user->assignRole('admin');
        return $user;
    }

    // ───────────── Inscription / Loi 09-08 ─────────────

    public function test_inscription_refusee_sans_consentement(): void
    {
        $payload = [
            'nom' => 'Alaoui', 'prenom' => 'Sara', 'email' => 'sara@example.com',
            'password' => 'motdepasse1', 'password_confirmation' => 'motdepasse1',
            'date_naissance' => now()->subYears(12)->toDateString(), 'telephone' => '0600000000',
        ];

        $this->postJson('/api/register', $payload)->assertStatus(422)->assertJsonValidationErrors('consentement');

        $this->postJson('/api/register', $payload + ['consentement' => true])
            ->assertCreated()
            ->assertJsonPath('user.date_naissance', fn($d) => str_starts_with($d, now()->subYears(12)->toDateString()));

        $this->assertNotNull(User::where('email', 'sara@example.com')->first()->consentement_at);
    }

    public function test_export_des_donnees_personnelles(): void
    {
        $user = $this->lecteur();
        $book = Book::factory()->create(['titre' => 'Kalila']);
        Loan::create(['book_id' => $book->id, 'user_id' => $user->id, 'date_pret' => today(), 'date_retour_prevue' => today()->addDays(3)]);
        Sanctum::actingAs($user);

        $this->getJson('/api/me/export')
            ->assertOk()
            ->assertJsonPath('profil.email', $user->email)
            ->assertJsonPath('emprunts.0.livre', 'Kalila');
    }

    public function test_suppression_du_compte(): void
    {
        $user = $this->lecteur();
        ContactRequest::create(['nom' => 'x', 'email' => $user->email, 'sujet' => 's', 'message' => 'm']);
        Sanctum::actingAs($user);

        $this->deleteJson('/api/me', ['password' => 'mauvais'])->assertStatus(422);
        $this->deleteJson('/api/me', ['password' => 'password'])->assertNoContent();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('contact_requests', ['email' => $user->email]);
    }

    public function test_suppression_refusee_avec_livre_non_rendu(): void
    {
        $user = $this->lecteur();
        $book = Book::factory()->create();
        Loan::create(['book_id' => $book->id, 'user_id' => $user->id, 'date_pret' => today(), 'date_retour_prevue' => today()->addDays(3)]);
        Sanctum::actingAs($user);

        $this->deleteJson('/api/me', ['password' => 'password'])->assertStatus(422);
    }

    // ───────────── Avis ─────────────

    public function test_avis_reserve_aux_lecteurs_ayant_emprunte(): void
    {
        $user = $this->lecteur();
        $book = Book::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/books/{$book->id}/reviews", ['note' => 5])->assertForbidden();

        Loan::create(['book_id' => $book->id, 'user_id' => $user->id, 'date_pret' => today(), 'date_retour_prevue' => today()->addDays(3)]);

        $this->postJson("/api/books/{$book->id}/reviews", ['note' => 4, 'commentaire' => 'Très bien'])->assertCreated();
        // Second envoi = modification du même avis, pas un doublon
        $this->postJson("/api/books/{$book->id}/reviews", ['note' => 2])->assertOk();

        $this->assertSame(1, $book->reviews()->count());
        $this->assertEquals(2.0, $book->fresh()->note_moyenne);

        $this->getJson("/api/books/{$book->slug}")
            ->assertOk()
            ->assertJsonPath('can_review', true)
            ->assertJsonPath('my_review.note', 2)
            ->assertJsonPath('reviews.0.user.prenom', 'Lecteur');
    }

    public function test_seul_l_auteur_ou_un_admin_supprime_un_avis(): void
    {
        $auteur = $this->lecteur();
        $autre = $this->lecteur();
        $book = Book::factory()->create();
        Loan::create(['book_id' => $book->id, 'user_id' => $auteur->id, 'date_pret' => today(), 'date_retour_prevue' => today()->addDays(3)]);
        $review = $book->reviews()->create(['user_id' => $auteur->id, 'note' => 5]);

        Sanctum::actingAs($autre);
        $this->deleteJson("/api/reviews/{$review->id}")->assertForbidden();

        Sanctum::actingAs($this->admin());
        $this->deleteJson("/api/reviews/{$review->id}")->assertNoContent();
    }

    public function test_show_indique_si_le_livre_est_en_favori(): void
    {
        $user = $this->lecteur();
        $book = Book::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson("/api/books/{$book->slug}")->assertJsonPath('is_favorited', false);
        $this->postJson("/api/favorites/{$book->id}")->assertOk();
        $this->getJson("/api/books/{$book->slug}")->assertJsonPath('is_favorited', true);
    }

    // ───────────── Double authentification ─────────────

    public function test_parcours_complet_2fa(): void
    {
        $user = $this->lecteur();
        Sanctum::actingAs($user);

        $this->postJson('/api/two-factor/enable', ['password' => 'mauvais'])->assertStatus(422);

        $secret = $this->postJson('/api/two-factor/enable', ['password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['qr_code_svg', 'secret'])
            ->json('secret');

        $this->postJson('/api/two-factor/confirm', ['code' => '000000'])->assertStatus(422);

        $codes = $this->postJson('/api/two-factor/confirm', ['code' => (new Google2FA())->getCurrentOtp($secret)])
            ->assertOk()
            ->json('recovery_codes');
        $this->assertCount(8, $codes);

        // Connexion : le mot de passe ne suffit plus, il faut le code
        $this->app['auth']->forgetGuards();
        $challenge = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('two_factor', true)
            ->assertJsonMissingPath('token')
            ->json('challenge');

        $this->postJson('/api/two-factor-challenge', ['challenge' => $challenge, 'code' => '000000'])->assertStatus(422);

        // Un code de secours fonctionne une seule fois
        $this->postJson('/api/two-factor-challenge', ['challenge' => $challenge, 'recovery_code' => $codes[0]])
            ->assertOk()
            ->assertJsonStructure(['token', 'user', 'roles']);
        $this->assertNotContains($codes[0], $user->fresh()->recoveryCodes());

        // Le challenge est consommé
        $this->postJson('/api/two-factor-challenge', ['challenge' => $challenge, 'recovery_code' => $codes[1]])->assertStatus(422);
    }

    public function test_connexion_sans_2fa_renvoie_un_token(): void
    {
        $user = $this->lecteur();

        $this->postJson('/api/login', ['email' => strtoupper($user->email), 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['date_naissance'], 'roles']);
    }

    // ───────────── Admin : sponsors et messages ─────────────

    public function test_admin_gere_les_sponsors(): void
    {
        Sanctum::actingAs($this->admin());

        $id = $this->postJson('/api/admin/sponsors', ['nom' => 'Commune de Tafraout', 'logo' => 'https://example.com/logo.png', 'ordre' => 1])
            ->assertCreated()->json('id');
        $this->putJson("/api/admin/sponsors/{$id}", ['nom' => 'Commune'])->assertOk()->assertJsonPath('nom', 'Commune');
        $this->getJson('/api/sponsors')->assertOk()->assertJsonCount(1);
        $this->deleteJson("/api/admin/sponsors/{$id}")->assertNoContent();
        $this->assertSame(0, Sponsor::count());
    }

    public function test_admin_gere_les_messages_de_contact(): void
    {
        $message = ContactRequest::create(['nom' => 'Ali', 'email' => 'ali@example.com', 'sujet' => 'Livre', 'message' => 'Bonjour']);
        Sanctum::actingAs($this->admin());

        $this->getJson('/api/admin/contacts')->assertOk()->assertJsonPath('non_lus', 1)->assertJsonCount(1, 'data');
        $this->patchJson("/api/admin/contacts/{$message->id}/read")->assertOk()->assertJsonPath('lu', true);
        $this->getJson('/api/admin/contacts?filtre=non_lus')->assertOk()->assertJsonCount(0, 'data');
        $this->deleteJson("/api/admin/contacts/{$message->id}")->assertNoContent();
    }
}
