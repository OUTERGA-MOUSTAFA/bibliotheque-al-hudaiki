<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoApiTransport;
use Tests\TestCase;

// MAIL_MAILER=brevo doit passer par l'API HTTPS de Brevo (Railway bloque le SMTP)
class BrevoMailerTest extends TestCase
{
    public function test_le_mailer_brevo_utilise_l_api_https(): void
    {
        config(['services.brevo.key' => 'xkeysib-test']);

        $transport = Mail::mailer('brevo')->getSymfonyTransport();

        $this->assertInstanceOf(BrevoApiTransport::class, $transport);
        $this->assertSame('brevo+api://api.brevo.com', (string) $transport);
    }
}
