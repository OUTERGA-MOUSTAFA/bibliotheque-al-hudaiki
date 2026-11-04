<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'lecteur', 'guard_name' => 'web']);
    }

    public function test_les_erreurs_de_validation_suivent_la_langue_demandee(): void
    {
        $this->postJson('/api/contact', [], ['Accept-Language' => 'ar'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'حقل البريد الإلكتروني إلزامي.')
            ->assertHeader('Content-Language', 'ar');

        $this->postJson('/api/contact', [], ['Accept-Language' => 'fr'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Le champ e-mail est obligatoire.');
    }

    public function test_le_francais_est_la_langue_par_defaut(): void
    {
        $this->postJson('/api/login', ['email' => 'x@example.com', 'password' => 'faux'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Les identifiants sont incorrects.');
    }

    public function test_les_messages_metier_sont_traduits_en_arabe(): void
    {
        $user = User::factory()->create(['nom' => 'T', 'prenom' => 'L', 'statut' => 'actif', 'date_naissance' => now()->subYears(20)]);
        $user->assignRole('lecteur');
        Sanctum::actingAs($user);
        $book = Book::factory()->create(['stock' => 0, 'statut' => 'emprunte']);

        $this->postJson('/api/loans', ['book_id' => $book->id, 'borrow_duration' => 3], ['Accept-Language' => 'ar'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'الكتاب غير متوفر.');
    }

    public function test_les_messages_avec_parametre_sont_traduits(): void
    {
        $user = User::factory()->create(['nom' => 'T', 'prenom' => 'L', 'statut' => 'actif', 'date_naissance' => now()->subYears(20)]);
        $user->assignRole('lecteur');
        Sanctum::actingAs($user);
        $book = Book::factory()->create(['stock' => 2, 'statut' => 'disponible', 'max_borrow_days' => 7]);

        $this->postJson('/api/loans', ['book_id' => $book->id, 'borrow_duration' => 30], ['Accept-Language' => 'ar'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'المدة القصوى لإعارة هذا الكتاب بالأيام: 7.');
    }

    public function test_les_erreurs_generiques_sont_traduites(): void
    {
        $this->getJson('/api/me', ['Accept-Language' => 'ar'])
            ->assertStatus(401)
            ->assertJsonPath('message', 'انتهت جلستك. يرجى تسجيل الدخول من جديد.');

        $user = User::factory()->create(['nom' => 'T', 'prenom' => 'L', 'statut' => 'actif']);
        $user->assignRole('lecteur');
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/dashboard', ['Accept-Language' => 'ar'])
            ->assertStatus(403)
            ->assertJsonPath('message', 'لا تملك صلاحية القيام بهذا الإجراء.');

        $this->getJson('/api/books/livre-inexistant', ['Accept-Language' => 'fr'])
            ->assertStatus(404)
            ->assertJsonPath('message', 'Élément introuvable.');
    }

    // Garde-fou : tout texte passé à __() dans l'application doit avoir sa traduction arabe
    public function test_chaque_message_a_une_traduction_arabe(): void
    {
        $ar = json_decode(file_get_contents(lang_path('ar.json')), true);
        $files = array_merge(
            glob(app_path('Http/Controllers/Api/*.php')),
            [app_path('Services/ImageUploader.php'), app_path('Providers/AppServiceProvider.php')],
        );

        $missing = [];
        foreach ($files as $file) {
            $tokens = token_get_all(file_get_contents($file));
            foreach ($tokens as $i => $token) {
                if (is_array($token) && $token[0] === T_STRING && $token[1] === '__') {
                    // Premier littéral après « __( »
                    for ($j = $i + 1; $j < count($tokens); $j++) {
                        if (is_array($tokens[$j]) && $tokens[$j][0] === T_CONSTANT_ENCAPSED_STRING) {
                            $key = eval('return ' . $tokens[$j][1] . ';');
                            if (!isset($ar[$key])) $missing[] = basename($file) . ' : ' . $key;
                            break;
                        }
                        if ($tokens[$j] === ')') break;
                    }
                }
            }
        }

        $this->assertSame([], $missing, "Textes sans traduction dans lang/ar.json");
    }
}
