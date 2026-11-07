<?php

namespace Tests\Feature;

use App\Console\Commands\NotifyLateLoans;
use App\Mail\LateLoanMail;
use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReliabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'lecteur', 'guard_name' => 'web']);
    }

    private function admin(): void
    {
        $u = User::factory()->create(['nom' => 'A', 'prenom' => 'Admin', 'statut' => 'actif']);
        $u->assignRole('admin');
        Sanctum::actingAs($u);
    }

    // ───────────── Pagination et recherche admin ─────────────

    public function test_liste_admin_des_livres_paginee_sans_les_archives(): void
    {
        $this->admin();
        Book::factory()->count(25)->create(['statut' => 'disponible']);
        Book::factory()->count(3)->create(['statut' => 'archive']);

        $this->getJson('/api/admin/books?statut=actifs&per_page=20&page=2')
            ->assertOk()
            ->assertJsonPath('total', 25)
            ->assertJsonPath('last_page', 2)
            ->assertJsonCount(5, 'data');
    }

    public function test_recherche_et_filtre_des_utilisateurs(): void
    {
        $this->admin();
        User::factory()->create(['nom' => 'Alaoui', 'prenom' => 'Sara', 'email' => 'sara@example.com', 'statut' => 'actif']);
        User::factory()->create(['nom' => 'Bennani', 'prenom' => 'Omar', 'email' => 'omar@example.com', 'statut' => 'archive']);

        $this->getJson('/api/admin/users?q=alaou')->assertJsonPath('total', 1)->assertJsonPath('data.0.prenom', 'Sara');
        $this->getJson('/api/admin/users?statut=archive')->assertJsonPath('total', 1)->assertJsonPath('data.0.prenom', 'Omar');
    }

    // ───────────── Rappels de retard ─────────────

    public function test_jours_de_rappel(): void
    {
        $relances = array_values(array_filter(range(0, 30), [NotifyLateLoans::class, 'doitRelancer']));
        $this->assertSame([1, 3, 7, 14, 21, 28], $relances);
    }

    public function test_pas_de_rappel_les_autres_jours(): void
    {
        Mail::fake();
        $user = User::factory()->create(['nom' => 'L', 'prenom' => 'Sara', 'statut' => 'actif']);
        $livre = Book::factory()->create();
        foreach ([2, 3, 5] as $retard) {
            Loan::create([
                'book_id' => $livre->id, 'user_id' => $user->id,
                'date_pret' => today()->subDays(20), 'date_retour_prevue' => today()->subDays($retard),
            ]);
        }

        $this->artisan('loans:notify-late')->assertSuccessful();

        Mail::assertQueued(LateLoanMail::class, 1); // seulement le prêt à 3 jours de retard
    }

    public function test_les_taches_sont_planifiees_a_l_heure_du_maroc(): void
    {
        $taches = collect(app(Schedule::class)->events())
            ->mapWithKeys(fn($e) => [trim(str_replace(["'", '"'], '', explode('artisan', $e->command)[1] ?? '')) => $e]);

        $rappel = $taches['loans:notify-late'];
        $this->assertSame('0 9 * * *', $rappel->expression);
        $this->assertSame('Africa/Casablanca', $rappel->timezone);
        $this->assertTrue($rappel->onOneServer);
        $this->assertArrayHasKey('sanctum:prune-expired --hours=24', $taches->all());
    }

    // ───────────── Index ─────────────

    public function test_les_index_de_performance_existent(): void
    {
        $this->assertTrue(Schema::hasIndex('loans', ['user_id']));
        $this->assertTrue(Schema::hasIndex('loans', ['book_id']));
        $this->assertTrue(Schema::hasIndex('books', ['statut']));
        $this->assertTrue(Schema::hasIndex('books', ['categorie_id']));
    }
}
