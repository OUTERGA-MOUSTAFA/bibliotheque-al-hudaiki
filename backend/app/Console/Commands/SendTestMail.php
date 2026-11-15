<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

// Vérifie la configuration d'envoi d'e-mails (Railway, .env) :
//   php artisan mail:test vous@exemple.com
class SendTestMail extends Command
{
    protected $signature = 'mail:test {destinataire : Adresse qui doit recevoir l\'e-mail de test}';
    protected $description = 'Envoie un e-mail de test et affiche la configuration utilisée (sans mot de passe)';

    public function handle(): int
    {
        $mailer = config('mail.default');
        $this->line("Mailer       : {$mailer}");
        if ($mailer === 'smtp') {
            $this->line('Serveur SMTP : ' . config('mail.mailers.smtp.host') . ':' . config('mail.mailers.smtp.port'));
            $this->line('Identifiant  : ' . (config('mail.mailers.smtp.username') ?: '(vide)'));
        }
        $this->line('Expéditeur   : ' . config('mail.from.address') . ' (' . config('mail.from.name') . ')');

        if (in_array($mailer, ['log', 'array'], true)) {
            $this->warn("Le mailer « {$mailer} » n'envoie rien : les e-mails vont dans les logs. Mettez MAIL_MAILER=smtp ou resend.");
        }

        try {
            Mail::raw(
                "Ceci est un e-mail de test de la Bibliothèque Al Hudaiki.\nSi vous le recevez, l'envoi d'e-mails fonctionne.",
                fn($m) => $m->to($this->argument('destinataire'))->subject('Test d\'envoi — Bibliothèque Al Hudaiki')
            );
        } catch (\Throwable $e) {
            $this->error('Échec : ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->info('E-mail envoyé à ' . $this->argument('destinataire') . '. Vérifiez aussi les courriers indésirables.');
        return self::SUCCESS;
    }
}
