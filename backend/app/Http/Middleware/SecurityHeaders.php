<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// En-têtes de sécurité sur toutes les réponses de l'API.
// L'API ne renvoie que du JSON : rien ne doit être interprété comme une page, ni affiché dans un cadre.
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $headers = $response->headers;
        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('X-Frame-Options', 'DENY');
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $headers->remove('X-Powered-By');

        // HTTPS obligatoire pendant 1 an (seulement en HTTPS : sinon le navigateur l'ignore)
        if ($request->isSecure()) {
            $headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Les réponses d'un utilisateur connecté (profil, prêts…) ne doivent pas rester en cache
        if ($request->bearerToken()) {
            $headers->set('Cache-Control', 'no-store, private');
        }

        return $response;
    }
}
