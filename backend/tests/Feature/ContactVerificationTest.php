<?php

namespace Tests\Feature;

use App\Mail\ContactRequestMail;
use App\Mail\ContactVerificationMail;
use App\Models\ContactRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContactVerificationTest extends TestCase
{
    use RefreshDatabase;

    private array $formulaire = ['nom' => 'Sara', 'email' => 'sara@example.com', 'sujet' => 'Horaires', 'message' => 'Bonjour'];

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        config(['mail.admin_address' => 'admin@bibliotheque.test']);
        Mail::fake();
    }

    /** Envoie le formulaire et récupère le code reçu par e-mail */
    private function envoyer(array $headers = []): array
    {
        $token = $this->postJson('/api/contact', $this->formulaire, $headers)->assertCreated()->json('token');

        $code = null;
        Mail::assertSent(ContactVerificationMail::class, function (ContactVerificationMail $m) use (&$code) {
            $code = $m->code;
            return $m->hasTo('sara@example.com');
        });

        return [$token, $code];
    }

    public function test_le_code_part_au_visiteur_et_rien_a_l_admin(): void
    {
        [$token, $code] = $this->envoyer();

        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
        $this->assertNotEmpty($token);
        Mail::assertNotSent(ContactRequestMail::class);
        // Le code n'est jamais stocké en clair
        $this->assertDatabaseMissing('contact_requests', ['verification_code_hash' => $code]);
    }

    public function test_bon_code_le_message_est_transmis_a_l_admin_une_seule_fois(): void
    {
        [$token, $code] = $this->envoyer();

        $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $code])->assertOk();
        $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $code])->assertOk();

        Mail::assertSent(ContactRequestMail::class, 1);
        $this->assertNotNull(ContactRequest::first()->verified_at);
    }

    public function test_mauvais_code_puis_blocage_apres_5_essais(): void
    {
        [$token, $code] = $this->envoyer();
        $faux = $code === '000000' ? '111111' : '000000';

        $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $faux])
            ->assertStatus(422)->assertJsonPath('errors.code.0', 'Code incorrect. Il vous reste 4 essais.');

        foreach (range(1, 4) as $_) {
            $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $faux]);
        }

        // Même le bon code est refusé : il faut en demander un nouveau
        $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $code])
            ->assertStatus(422)->assertJsonPath('errors.code.0', 'Trop de codes incorrects. Demandez un nouveau code.');
        Mail::assertNotSent(ContactRequestMail::class);
    }

    public function test_code_expire(): void
    {
        [$token, $code] = $this->envoyer();
        $this->travel(16)->minutes();

        $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $code])
            ->assertStatus(422)->assertJsonPath('errors.code.0', 'Ce code a expiré. Demandez-en un nouveau.');
    }

    public function test_renvoi_limite_a_un_par_minute_et_nouveau_code_valide(): void
    {
        [$token, $ancien] = $this->envoyer();

        $this->postJson('/api/contact/resend', ['token' => $token])->assertStatus(429);

        $this->travel(61)->seconds();
        $this->postJson('/api/contact/resend', ['token' => $token])->assertOk();

        $nouveau = null;
        Mail::assertSent(ContactVerificationMail::class, function (ContactVerificationMail $m) use (&$nouveau) {
            $nouveau = $m->code; // le dernier envoyé
            return true;
        });

        $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $nouveau])->assertOk();
    }

    public function test_e_mail_dans_la_langue_du_visiteur(): void
    {
        $this->postJson('/api/contact', $this->formulaire, ['Accept-Language' => 'ar'])->assertCreated()
            ->assertJsonPath('message', 'أُرسل رمز تحقق إلى بريدك الإلكتروني.');

        Mail::assertSent(ContactVerificationMail::class, function (ContactVerificationMail $m) {
            $html = $m->render();
            return $m->locale === 'ar'
                && str_contains($html, 'لإرسال رسالتك إلى المكتبة')
                && str_contains($html, '/ar/contact/verifier?token=');
        });
    }

    public function test_jeton_inconnu(): void
    {
        $this->postJson('/api/contact/verify', ['token' => 'inconnu', 'code' => '123456'])
            ->assertStatus(422)->assertJsonValidationErrors('code');
    }

    public function test_envoi_impossible_le_message_n_est_pas_garde(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP indisponible'));

        $this->postJson('/api/contact', $this->formulaire)->assertStatus(503);
        $this->assertDatabaseCount('contact_requests', 0);
    }

    public function test_l_admin_ne_voit_que_les_messages_verifies_et_les_autres_sont_purges(): void
    {
        [$token, $code] = $this->envoyer();               // vérifié ci-dessous
        $this->postJson('/api/contact/verify', ['token' => $token, 'code' => $code])->assertOk();
        $this->postJson('/api/contact', ['email' => 'faux@example.com'] + $this->formulaire)->assertCreated(); // jamais vérifié

        $admin = User::factory()->create(['nom' => 'A', 'prenom' => 'Admin', 'statut' => 'actif']);
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/contacts')->assertJsonCount(1, 'data')->assertJsonPath('non_lus', 1);

        $this->travel(25)->hours();
        $this->artisan('model:prune', ['--model' => [ContactRequest::class]])->assertSuccessful();
        $this->assertDatabaseCount('contact_requests', 1);
    }

    public function test_commande_mail_test(): void
    {
        $this->artisan('mail:test', ['destinataire' => 'moi@example.com'])->assertSuccessful();
    }
}
