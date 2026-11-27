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
        if ($mailer === 'brevo') {
            $cle = (string) config('services.brevo.key');
            // Seuls les 4 derniers caractères sont affichés, pour reconnaître la clé sans la révéler
            $this->line('Clé Brevo    : ' . ($cle === '' ? '(vide : BREVO_API_KEY manquante)' : '…' . substr($cle, -4)));
        }
        $this->line('Expéditeur   : ' . config('mail.from.address') . ' (' . config('mail.from.name') . ')');

        if (in_array($mailer, ['log', 'array'], true)) {
            $this->warn("Le mailer « {$mailer} » n'envoie rien : les e-mails vont dans les logs. Mettez MAIL_MAILER=brevo.");
        }

        try {
            Mail::raw(
                "Ceci est un e-mail de test de la Bibliothèque Al Hudaiki.\nSi vous le recevez, l'envoi d'e-mails fonctionne.",
                fn($m) => $m->to($this->argument('destinataire'))->subject('Test d\'envoi — Bibliothèque Al Hudaiki')
            );
        } catch (\Throwable $e) {
            $this->error('Échec : ' . $e->getMessage());
            if ($conseil = self::conseil($e->getMessage())) {
                $this->warn($conseil);
            }
            return self::FAILURE;
        }

        $this->info('E-mail envoyé à ' . $this->argument('destinataire') . '. Vérifiez aussi les courriers indésirables.');
        return self::SUCCESS;
    }

    // Que faire pour les refus les plus fréquents de Brevo
    public static function conseil(string $erreur): ?string
    {
        $e = strtolower($erreur);

        return match (true) {
            str_contains($e, 'unrecognised ip') || str_contains($e, 'unrecognized ip')
                => "Brevo bloque l'adresse IP de Railway : Brevo → Paramètres → Sécurité → IP autorisées → désactiver le blocage des IP inconnues.",
            str_contains($e, 'key not found') || str_contains($e, 'api key')
                => 'Clé API refusée : recopiez une clé « xkeysib-… » (SMTP & API → Clés API) dans BREVO_API_KEY, sans espace ni guillemet.',
            str_contains($e, 'sender')
                => 'Expéditeur refusé : MAIL_FROM_ADDRESS doit être une adresse vérifiée dans Brevo → Expéditeurs.',
            str_contains($e, 'not activated') || str_contains($e, 'not yet activated') || str_contains($e, 'suspended')
                => "Compte Brevo pas encore activé pour l'envoi transactionnel : terminez la validation du compte (e-mail de Brevo, profil complet).",
            default => null,
        };
    }
}
