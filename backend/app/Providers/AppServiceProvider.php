<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 🛡️ Rate Limiting (يمنع تخمين كلمة السر)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // 🛡️ Rate Limiting 9assi l'Login w Register (6 attempts f d9i9a)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

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
