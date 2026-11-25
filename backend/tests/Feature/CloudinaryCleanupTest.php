<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\HeroSlide;
use App\Models\Sponsor;
use App\Models\User;
use App\Services\ImageUploader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

// Les images Cloudinary retirées par l'admin doivent aussi disparaître de Cloudinary
class CloudinaryCleanupTest extends TestCase
{
    use RefreshDatabase;

    private const BASE = 'https://res.cloudinary.com/moncompte/image/upload/v1731600000/al-hudaiki';

    /** @var string[] identifiants Cloudinary effacés pendant le test */
    private array $effaces = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.cloudinary.cloud_name' => 'moncompte']);
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Rien n'est envoyé ni effacé pour de vrai : on note seulement les appels
        $effaces = &$this->effaces;
        $this->app->instance(ImageUploader::class, new class($effaces) extends ImageUploader {
            public function __construct(private array &$effaces) {}

            public function upload(UploadedFile $file, string $folder): string
            {
                return "https://res.cloudinary.com/moncompte/image/upload/v2/al-hudaiki/{$folder}/nouvelle.jpg";
            }

            protected function detruire(string $publicId): void
            {
                $this->effaces[] = $publicId;
            }
        });

        // Les effacements différés (defer) s'exécutent tout de suite pendant les tests
        $this->withoutDefer();
    }

    private function admin(): void
    {
        $u = User::factory()->create(['nom' => 'A', 'prenom' => 'Admin', 'statut' => 'actif']);
        $u->assignRole('admin');
        Sanctum::actingAs($u);
    }

    public function test_identifiant_cloudinary_extrait_de_l_url(): void
    {
        $up = app(ImageUploader::class);

        $this->assertSame('al-hudaiki/books/abc', $up->publicId(self::BASE . '/books/abc.jpg'));
        $this->assertSame('al-hudaiki/hero/x', $up->publicId('https://res.cloudinary.com/moncompte/image/upload/al-hudaiki/hero/x.png'));
        // Images qui ne nous appartiennent pas : jamais effacées
        $this->assertNull($up->publicId('https://images.unsplash.com/photo-1'));
        $this->assertNull($up->publicId('https://res.cloudinary.com/autrecompte/image/upload/v1/al-hudaiki/books/abc.jpg'));
        $this->assertNull($up->publicId('https://res.cloudinary.com/moncompte/image/upload/v1/autre-site/abc.jpg'));
        $this->assertNull($up->publicId(null));
    }

    public function test_remplacer_la_couverture_efface_l_ancienne(): void
    {
        $this->admin();
        $book = Book::factory()->create(['image' => self::BASE . '/books/ancienne.jpg']);

        $this->post("/api/admin/books/{$book->id}", [
            '_method' => 'PUT',
            'image' => UploadedFile::fake()->image('nouvelle.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();

        $this->assertSame(['al-hudaiki/books/ancienne'], $this->effaces);
    }

    public function test_supprimer_un_livre_efface_sa_couverture(): void
    {
        $this->admin();
        $book = Book::factory()->create(['image' => self::BASE . '/books/livre.jpg']);

        $this->deleteJson("/api/admin/books/{$book->id}")->assertNoContent();

        $this->assertSame(['al-hudaiki/books/livre'], $this->effaces);
        // L'historique des prêts affiche la couverture par défaut
        $this->assertSame(Book::IMAGE_PAR_DEFAUT, Book::withTrashed()->find($book->id)->image);
    }

    public function test_modifier_un_livre_sans_toucher_a_l_image_n_efface_rien(): void
    {
        $this->admin();
        $book = Book::factory()->create(['image' => self::BASE . '/books/livre.jpg']);

        $this->putJson("/api/admin/books/{$book->id}", ['titre' => 'Nouveau titre'])->assertOk();

        $this->assertSame([], $this->effaces);
    }

    public function test_image_encore_utilisee_ailleurs_n_est_pas_effacee(): void
    {
        $url = self::BASE . '/hero/partagee.jpg';
        $slide = HeroSlide::create(['image' => $url, 'ordre' => 0, 'actif' => true]);
        HeroSlide::create(['image' => $url, 'ordre' => 1, 'actif' => true]);

        $slide->delete();

        $this->assertSame([], $this->effaces);
    }

    public function test_supprimer_une_diapositive_et_un_partenaire(): void
    {
        $this->admin();
        $slide = HeroSlide::create(['image' => self::BASE . '/hero/banniere.jpg', 'ordre' => 0, 'actif' => true]);
        $sponsor = Sponsor::create(['nom' => 'Commune', 'logo' => self::BASE . '/sponsors/logo.png']);

        $this->deleteJson("/api/admin/hero/slides/{$slide->id}")->assertNoContent();
        $this->deleteJson("/api/admin/sponsors/{$sponsor->id}")->assertNoContent();

        $this->assertSame(['al-hudaiki/hero/banniere', 'al-hudaiki/sponsors/logo'], $this->effaces);
    }

    public function test_image_externe_jamais_envoyee_a_cloudinary(): void
    {
        $sponsor = Sponsor::create(['nom' => 'Externe', 'logo' => 'https://exemple.ma/logo.png']);
        $sponsor->update(['logo' => 'https://exemple.ma/logo2.png']);
        $sponsor->delete();

        $this->assertSame([], $this->effaces);
    }
}
