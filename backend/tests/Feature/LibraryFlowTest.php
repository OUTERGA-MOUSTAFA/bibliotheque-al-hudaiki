<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LibraryFlowTest extends TestCase
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
        $user = User::factory()->create(array_merge([
            'nom' => 'Test', 'prenom' => 'Lecteur', 'statut' => 'actif',
            'date_naissance' => now()->subYears(20),
        ], $attrs));
        $user->assignRole('lecteur');
        return $user;
    }

    private function admin(): User
    {
        $user = User::factory()->create(['nom' => 'Admin', 'prenom' => 'A', 'statut' => 'actif']);
        $user->assignRole('admin');
        return $user;
    }

    public function test_un_lecteur_peut_emprunter_avec_la_duree_choisie(): void
    {
        $book = Book::factory()->create(['stock' => 1, 'max_borrow_days' => 21]);
        Sanctum::actingAs($this->lecteur());

        $this->postJson('/api/loans', ['book_id' => $book->id, 'borrow_duration' => 7])
            ->assertCreated();

        $loan = Loan::first();
        $this->assertSame(today()->addDays(7)->toDateString(), $loan->date_retour_prevue->toDateString());
        $this->assertSame(0, $book->fresh()->stock);
        $this->assertSame('emprunte', $book->fresh()->statut);
    }

    public function test_la_duree_ne_peut_pas_depasser_le_max_du_livre(): void
    {
        $book = Book::factory()->create(['max_borrow_days' => 10]);
        Sanctum::actingAs($this->lecteur());

        $this->postJson('/api/loans', ['book_id' => $book->id, 'borrow_duration' => 30])
            ->assertStatus(422);
    }

    public function test_impossible_d_emprunter_deux_fois_le_meme_livre(): void
    {
        $book = Book::factory()->create(['stock' => 5]);
        Sanctum::actingAs($this->lecteur());

        $this->postJson('/api/loans', ['book_id' => $book->id, 'borrow_duration' => 7])->assertCreated();
        $this->postJson('/api/loans', ['book_id' => $book->id, 'borrow_duration' => 7])->assertStatus(422);
    }

    public function test_mes_emprunts_et_retour_par_admin(): void
    {
        $book = Book::factory()->create(['stock' => 1]);
        $lecteur = $this->lecteur();
        Sanctum::actingAs($lecteur);
        $this->postJson('/api/loans', ['book_id' => $book->id, 'borrow_duration' => 7])->assertCreated();

        $this->getJson('/api/my-loans')
            ->assertOk()
            ->assertJsonPath('data.0.statut', 'en cours')
            ->assertJsonPath('data.0.book.id', $book->id);

        Sanctum::actingAs($this->admin());
        $loanId = Loan::first()->id;

        $this->getJson('/api/admin/loans')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson("/api/admin/loans/{$loanId}/return")->assertOk();
        $this->postJson("/api/admin/loans/{$loanId}/return")->assertStatus(422);

        $this->assertSame(1, $book->fresh()->stock);
        $this->assertSame('disponible', $book->fresh()->statut);
    }

    public function test_les_livres_archives_sont_caches_au_public(): void
    {
        $visible = Book::factory()->create();
        $archive = Book::factory()->create(['statut' => 'archive']);

        $this->getJson('/api/books')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/books?statut=archive')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/books/{$archive->slug}")->assertNotFound();
        $this->getJson("/api/books/{$visible->slug}")->assertOk();

        Sanctum::actingAs($this->admin());
        $this->getJson('/api/admin/books?statut=archive')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_recherche_insensible_a_la_casse_et_per_page_plafonne(): void
    {
        Book::factory()->create(['titre' => 'Le Petit Prince', 'slug' => 'le-petit-prince']);
        Book::factory()->count(3)->create();

        $this->getJson('/api/books?q=petit')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/books?per_page=100000')->assertOk()->assertJsonPath('per_page', 50);
    }

    public function test_slug_unique_pour_un_titre_identique(): void
    {
        Sanctum::actingAs($this->admin());
        $payload = ['titre' => 'Kalila wa Dimna', 'stock' => 1, 'max_borrow_days' => 14];

        $this->postJson('/api/admin/books', $payload)->assertCreated()->assertJsonPath('slug', 'kalila-wa-dimna');
        $this->postJson('/api/admin/books', $payload)->assertCreated()->assertJsonPath('slug', 'kalila-wa-dimna-2');
    }

    public function test_favoris_toggle(): void
    {
        $book = Book::factory()->create();
        Sanctum::actingAs($this->lecteur());

        $this->postJson("/api/favorites/{$book->id}")->assertOk()->assertJson(['favorited' => true]);
        $this->getJson('/api/favorites')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson("/api/favorites/{$book->id}")->assertOk()->assertJson(['favorited' => false]);
        $this->assertSame(0, $book->fresh()->nb_favoris);
    }

    public function test_formulaire_de_contact(): void
    {
        $this->postJson('/api/contact', [
            'nom' => 'Ahmed', 'email' => 'ahmed@example.com', 'sujet' => 'Livre', 'message' => 'Bonjour',
        ])->assertCreated();

        $this->assertDatabaseHas('contact_requests', ['email' => 'ahmed@example.com', 'sujet' => 'Livre']);
    }

    public function test_admin_archive_et_supprime_un_utilisateur(): void
    {
        $admin = $this->admin();
        $lecteur = $this->lecteur();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/users/{$lecteur->id}/archive")->assertOk();
        $this->assertSame('archive', $lecteur->fresh()->statut);

        $this->patchJson("/api/admin/users/{$admin->id}/archive")->assertStatus(422);

        $this->deleteJson("/api/admin/users/{$lecteur->id}")->assertNoContent();
        $this->assertDatabaseMissing('users', ['id' => $lecteur->id]);
    }

    public function test_un_lecteur_ne_peut_pas_acceder_a_l_admin(): void
    {
        Sanctum::actingAs($this->lecteur());
        $this->getJson('/api/admin/loans')->assertForbidden();
    }

    public function test_mise_a_jour_du_profil(): void
    {
        $lecteur = $this->lecteur();
        Sanctum::actingAs($lecteur);

        $this->putJson('/api/profile', ['telephone' => '0600000000', 'prenom' => 'Sara'])
            ->assertOk()
            ->assertJsonPath('user.telephone', '0600000000');

        $this->assertSame('Sara Test', $lecteur->fresh()->name);

        // Changer le mot de passe sans l'ancien est refusé
        $this->putJson('/api/profile', ['password' => 'nouveau123', 'password_confirmation' => 'nouveau123'])
            ->assertStatus(422);
    }

    public function test_sponsors_publics(): void
    {
        $this->getJson('/api/sponsors')->assertOk()->assertJson([]);
    }
}
