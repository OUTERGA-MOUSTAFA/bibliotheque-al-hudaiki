<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Le frontend envoie « Accept-Language: fr » ou « ar » selon la langue de la page :
// messages d'erreur, validations et e-mails partent alors dans cette langue.
class SetLocaleFromHeader
{
    public const LOCALES = ['fr', 'ar'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->getPreferredLanguage(self::LOCALES) ?? config('app.locale');
        app()->setLocale($locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }
}
