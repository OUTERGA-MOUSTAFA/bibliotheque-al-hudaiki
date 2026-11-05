<?php

namespace Tests\Feature;

use App\Models\HeroSlide;
use App\Models\User;
use App\Services\ImageUploader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HeroTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'lecteur', 'guard_name' => 'web']);

        // Pas d'envoi réel sur Cloudinary pendant les tests
        $this->app->instance(ImageUploader::class, new class extends ImageUploader {
            public function upload(UploadedFile $file, string $folder): string
            {
                return "https://res.cloudinary.com/demo/al-hudaiki/{$folder}/{$file->getClientOriginalName()}";
            }
        });
    }

    private function admin(): User
    {
        $u = User::factory()->create(['nom' => 'A', 'prenom' => 'Admin', 'statut' => 'actif']);
        $u->assignRole('admin');
        Sanctum::actingAs($u);
        return $u;
    }

    private function slide(array $attrs = []): HeroSlide
    {
        return HeroSlide::create($attrs + [
            'image' => 'https://images.unsplash.com/photo-1',
            'titre_fr' => 'Bienvenue', 'titre_ar' => 'مرحباً',
            'sous_titre_fr' => 'Des livres pour tous', 'sous_titre_ar' => 'كتب للجميع',
            'bouton_fr' => 'Voir le catalogue', 'bouton_ar' => 'تصفح الفهرس',
            'lien' => '/catalogue', 'ordre' => 0, 'actif' => true,
        ]);
    }

    public function test_reglages_par_defaut_sans_diapositive(): void
    {
        $this->getJson('/api/hero')
            ->assertOk()
            ->assertJsonPath('reglages.modele', 'classique')
            ->assertJsonPath('reglages.defilement', 6)
            ->assertJsonCount(0, 'slides');
    }

    public function test_textes_dans_la_langue_demandee(): void
    {
        $this->slide();

        $this->getJson('/api/hero', ['Accept-Language' => 'ar'])
            ->assertJsonPath('slides.0.titre', 'مرحباً')
            ->assertJsonPath('slides.0.bouton', 'تصفح الفهرس');

        $this->getJson('/api/hero?locale=fr')->assertJsonPath('slides.0.titre', 'Bienvenue');
    }

    public function test_repli_sur_l_autre_langue(): void
    {
        $this->slide(['titre_ar' => null]);

        $this->getJson('/api/hero', ['Accept-Language' => 'ar'])->assertJsonPath('slides.0.titre', 'Bienvenue');
    }

    public function test_les_diapositives_masquees_n_apparaissent_pas_et_l_ordre_est_respecte(): void
    {
        $this->slide(['titre_fr' => 'Deuxième', 'ordre' => 2]);
        $this->slide(['titre_fr' => 'Première', 'ordre' => 1]);
        $this->slide(['titre_fr' => 'Cachée', 'ordre' => 0, 'actif' => false]);

        $this->getJson('/api/hero', ['Accept-Language' => 'fr'])
            ->assertJsonCount(2, 'slides')
            ->assertJsonPath('slides.0.titre', 'Première');
    }

    public function test_admin_ajoute_une_diapositive_avec_image(): void
    {
        $this->admin();

        $this->post('/api/admin/hero/slides', [
            'image_file' => UploadedFile::fake()->image('bibliotheque.jpg', 1600, 900),
            'titre_fr' => 'Nouveautés', 'titre_ar' => 'جديد المكتبة',
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('image', 'https://res.cloudinary.com/demo/al-hudaiki/hero/bibliotheque.jpg')
            ->assertJsonPath('titre_ar', 'جديد المكتبة');
    }

    public function test_une_image_est_obligatoire(): void
    {
        $this->admin();

        $this->postJson('/api/admin/hero/slides', ['titre_fr' => 'Sans image'], ['Accept-Language' => 'ar'])
            ->assertStatus(422)->assertJsonValidationErrors('image_file');
    }

    public function test_un_bouton_sans_lien_est_refuse(): void
    {
        $this->admin();
        $slide = $this->slide(['bouton_fr' => null, 'bouton_ar' => null, 'lien' => null]);

        $this->putJson("/api/admin/hero/slides/{$slide->id}", ['bouton_fr' => 'Voir'])
            ->assertStatus(422)->assertJsonValidationErrors('lien');

        $this->putJson("/api/admin/hero/slides/{$slide->id}", ['lien' => 'javascript:alert(1)'])
            ->assertStatus(422)->assertJsonValidationErrors('lien');
    }

    public function test_admin_modifie_masque_reordonne_et_supprime(): void
    {
        $this->admin();
        $a = $this->slide(['titre_fr' => 'A', 'ordre' => 0]);
        $b = $this->slide(['titre_fr' => 'B', 'ordre' => 1]);

        $this->putJson("/api/admin/hero/slides/{$a->id}", ['titre_fr' => 'A modifié', 'actif' => false])
            ->assertOk()->assertJsonPath('actif', false);

        $this->postJson('/api/admin/hero/slides/reorder', ['ids' => [$b->id, $a->id]])->assertOk();
        $this->assertSame(0, $b->fresh()->ordre);

        $this->deleteJson("/api/admin/hero/slides/{$b->id}")->assertNoContent();
        $this->assertDatabaseMissing('hero_slides', ['id' => $b->id]);
    }

    public function test_admin_choisit_le_modele_d_affichage(): void
    {
        $this->admin();

        $this->putJson('/api/admin/hero/settings', ['modele' => 'carrousel', 'defilement' => 8])
            ->assertOk()->assertJsonPath('modele', 'carrousel');

        $this->getJson('/api/hero')->assertJsonPath('reglages.modele', 'carrousel')->assertJsonPath('reglages.defilement', 8);

        $this->putJson('/api/admin/hero/settings', ['modele' => 'inconnu'])->assertStatus(422);
    }

    public function test_un_lecteur_ne_peut_pas_modifier_le_hero(): void
    {
        $u = User::factory()->create(['nom' => 'L', 'prenom' => 'Lecteur', 'statut' => 'actif']);
        $u->assignRole('lecteur');
        Sanctum::actingAs($u);

        $this->putJson('/api/admin/hero/settings', ['modele' => 'image'])->assertForbidden();
        $this->postJson('/api/admin/hero/slides', ['image' => 'https://x.test/a.jpg'])->assertForbidden();
    }
}
