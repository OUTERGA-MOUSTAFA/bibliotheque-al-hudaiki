<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Le frontend envoie « Accept-Language: fr » ou « ar » selon la langue de la page :
// messages d'erreur, validations, noms de catégories et e-mails suivent cette langue.
// Le paramètre ?locale=ar fait de même (requêtes serveur de Next.js, mises en cache par URL).
class SetLocaleFromHeader
{
    public const LOCALES = ['fr', 'ar'];

    public function handle(Request $request, Closure $next): Response
    {
        $explicit = in_array($request->query('locale'), self::LOCALES, true) ? $request->query('locale') : null;
        $locale = $explicit ?? $request->getPreferredLanguage(self::LOCALES) ?? config('app.locale');
        app()->setLocale($locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        // Mémorise la langue du lecteur connecté : les rappels de retard partiront dans sa langue
        $user = $request->user();
        if ($user && ($explicit || $request->hasHeader('Accept-Language')) && $user->locale !== $locale) {
            $user->forceFill(['locale' => $locale])->saveQuietly();
        }

        return $response;
    }
}
