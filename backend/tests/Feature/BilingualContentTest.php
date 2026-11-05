<?php

namespace Tests\Feature;

use App\Mail\LateLoanMail;
use App\Models\Book;
use App\Models\Category;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BilingualContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'lecteur', 'guard_name' => 'web']);
    }

    private function user(string $role = 'lecteur', array $attrs = []): User
    {
        $u = User::factory()->create($attrs + ['nom' => 'T', 'prenom' => 'Sara', 'statut' => 'actif', 'date_naissance' => now()->subYears(20)]);
        $u->assignRole($role);
        return $u;
    }

    // ───────────── Catégories ─────────────

    public function test_le_nom_de_categorie_suit_la_langue_demandee(): void
    {
        Category::create(['slug' => 'oloum', 'nom_fr' => 'Sciences', 'nom_ar' => 'علوم', 'description_fr' => 'Sciences et techniques', 'description_ar' => 'علوم وتقنيات', 'statut' => 'actif']);

        $this->getJson('/api/categories', ['Accept-Language' => 'fr'])
            ->assertJsonPath('0.nom', 'Sciences')->assertJsonPath('0.description', 'Sciences et techniques');

        $this->getJson('/api/categories', ['Accept-Language' => 'ar'])
            ->assertJsonPath('0.nom', 'علوم')->assertJsonPath('0.description', 'علوم وتقنيات');

        // Paramètre ?locale= (requêtes serveur de Next.js)
        $this->getJson('/api/categories?locale=ar')->assertJsonPath('0.nom', 'علوم');
    }

    public function test_repli_sur_l_autre_langue_si_la_traduction_manque(): void
    {
        Category::create(['slug' => 'din', 'nom_ar' => 'دين', 'statut' => 'actif']);

        $this->getJson('/api/categories', ['Accept-Language' => 'fr'])->assertJsonPath('0.nom', 'دين');
    }

    public function test_la_categorie_d_un_livre_est_traduite(): void
    {
        $cat = Category::create(['slug' => 'tarikh', 'nom_fr' => 'Histoire', 'nom_ar' => 'تاريخ', 'statut' => 'actif']);
        Book::factory()->create(['categorie_id' => $cat->id, 'statut' => 'disponible']);

        $this->getJson('/api/books', ['Accept-Language' => 'ar'])->assertJsonPath('data.0.categorie.nom', 'تاريخ');
        $this->getJson('/api/books', ['Accept-Language' => 'fr'])->assertJsonPath('data.0.categorie.nom', 'Histoire');
    }

    public function test_l_admin_cree_et_modifie_une_categorie_dans_les_deux_langues(): void
    {
        Sanctum::actingAs($this->user('admin'));

        $id = $this->postJson('/api/admin/categories', ['nom_fr' => 'Philosophie', 'nom_ar' => 'فلسفة'])
            ->assertCreated()
            ->assertJsonPath('nom_fr', 'Philosophie')
            ->assertJsonPath('nom_ar', 'فلسفة')
            ->json('id');

        $this->putJson("/api/admin/categories/{$id}", ['nom_fr' => 'Philosophie et pensée', 'nom_ar' => 'فلسفة وفكر'])
            ->assertOk()->assertJsonPath('nom_ar', 'فلسفة وفكر');

        $this->assertDatabaseHas('categories', ['id' => $id, 'nom' => 'Philosophie et pensée']);
    }

    public function test_une_categorie_sans_aucun_nom_est_refusee(): void
    {
        Sanctum::actingAs($this->user('admin'));

        $this->postJson('/api/admin/categories', ['description_fr' => 'x'], ['Accept-Language' => 'ar'])
            ->assertStatus(422)->assertJsonValidationErrors('nom_fr');

        $cat = Category::create(['slug' => 'x', 'nom_fr' => 'X', 'statut' => 'actif']);
        $this->putJson("/api/admin/categories/{$cat->id}", ['nom_fr' => '', 'nom_ar' => ''])
            ->assertStatus(422)->assertJsonValidationErrors('nom_fr');
    }

    // ───────────── Langue du lecteur ─────────────

    public function test_la_langue_du_lecteur_est_memorisee(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user);

        $this->getJson('/api/me', ['Accept-Language' => 'ar'])->assertOk();

        $this->assertSame('ar', $user->fresh()->locale);
    }

    public function test_connexion_enregistre_la_langue(): void
    {
        $user = $this->user(attrs: ['email' => 'sara@example.com', 'password' => 'motdepasse1']);

        $this->postJson('/api/login', ['email' => 'sara@example.com', 'password' => 'motdepasse1'], ['Accept-Language' => 'ar'])->assertOk();

        $this->assertSame('ar', $user->fresh()->locale);
    }

    public function test_rappel_de_retard_dans_la_langue_du_lecteur(): void
    {
        Mail::fake();
        $user = $this->user(attrs: ['locale' => 'ar']);
        $book = Book::factory()->create(['titre' => 'Le Petit Prince']);
        Loan::create([
            'book_id' => $book->id, 'user_id' => $user->id,
            'date_pret' => today()->subDays(20), 'date_retour_prevue' => today()->subDays(3),
        ]);

        $this->artisan('loans:notify-late')->assertSuccessful();

        Mail::assertQueued(LateLoanMail::class, function (LateLoanMail $mail) {
            $html = $mail->locale('ar')->render();
            return $mail->locale === 'ar'
                && str_contains($html, 'كان يجب إرجاع كتاب')
                && str_contains($html, '/ar/compte/emprunts');
        });
    }

    public function test_e_mail_de_reinitialisation_dans_la_langue_de_la_demande(): void
    {
        Notification::fake();
        $user = $this->user(attrs: ['email' => 'sara@example.com', 'locale' => 'fr']);

        $this->postJson('/api/forgot-password', ['email' => 'sara@example.com'], ['Accept-Language' => 'ar'])->assertOk();

        $this->assertSame('ar', $user->fresh()->locale);
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $n, array $channels, User $notifiable) {
            return $notifiable->preferredLocale() === 'ar';
        });
    }
}
