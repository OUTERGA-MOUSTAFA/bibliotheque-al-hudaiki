<?php

namespace App\Providers;

use App\Database\PostgresConnection;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Connection;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Booléens compatibles avec les requêtes préparées émulées (voir App\Database\PostgresConnection)
        Connection::resolverFor('pgsql', fn($pdo, $database, $prefix, $config) =>
            new PostgresConnection($pdo, $database, $prefix, $config));
    }

    public function boot(): void
    {
        // Mot de passe : 8 caractères minimum avec lettres et chiffres.
        // En production, on refuse aussi ceux qui ont fuité sur Internet (base Have I Been Pwned,
        // seuls les 5 premiers caractères du hash SHA-1 sont envoyés : le mot de passe ne sort pas).
        Password::defaults(fn () => $this->app->isProduction()
            ? Password::min(8)->letters()->numbers()->uncompromised()
            : Password::min(8)->letters()->numbers());

        // MAIL_MAILER=brevo : envoi par l'API HTTPS de Brevo
        Mail::extend('brevo', fn () => (new BrevoTransportFactory())->create(
            new Dsn('brevo+api', 'default', (string) config('services.brevo.key'))
        ));

        // 🛡️ Rate Limiting (يمنع تخمين كلمة السر)
        // Limite générale : contre l'aspiration du catalogue et les requêtes en rafale.
        // Les visiteurs anonymes ont plus de marge : les pages du site rendues par le serveur
        // Next.js (Vercel) appellent l'API depuis quelques adresses partagées.
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(120)->by('user:' . $request->user()->id)
                : Limit::perMinute(300)->by('ip:' . $request->ip());
        });

        // 🛡️ Rate Limiting 9assi l'Login w Register (6 attempts f d9i9a)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

        // Saisie du code de vérification du formulaire de contact (le code lui-même est limité à 5 essais)
        RateLimiter::for('contact-code', fn(Request $request) => Limit::perMinute(10)->by($request->ip()));

        // Le lien de réinitialisation pointe vers le frontend Next.js, pas vers Laravel
        ResetPassword::createUrlUsing(function ($user, string $token) {
            // La page s'ouvre dans la langue du lecteur (mise à jour lors de sa demande)
            $locale = $user->preferredLocale();

            return rtrim(config('app.frontend_url'), '/') . "/{$locale}/reinitialiser-mot-de-passe?" . http_build_query([
                'token' => $token,
                'email' => $user->email,
            ]);
        });

        ResetPassword::toMailUsing(function ($user, string $token) {
            $url = call_user_func(ResetPassword::$createUrlCallback, $user, $token);

            return (new MailMessage)
                ->subject(__('Réinitialisation de votre mot de passe'))
                ->greeting(__('Bonjour :prenom,', ['prenom' => $user->prenom]))
                ->line(__('Vous avez demandé à changer le mot de passe de votre compte à la bibliothèque.'))
                ->action(__('Choisir un nouveau mot de passe'), $url)
                ->line(__('Ce lien est valable 60 minutes.'))
                ->line(__("Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé."))
                ->salutation(__('Bibliothèque Al Hudaiki'));
        });
    }
}
