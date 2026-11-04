<?php

use App\Http\Middleware\SetLocaleFromHeader;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Pas de EnsureFrontendRequestsAreStateful : l'API fonctionne avec des tokens Bearer
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);

        // Langue de la réponse (fr / ar) choisie d'après l'en-tête Accept-Language
        $middleware->api(prepend: [SetLocaleFromHeader::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Messages génériques du framework, traduits dans la langue de la requête
        $json = fn(string $message, int $status) => response()->json(['message' => __($message)], $status);

        $exceptions->render(fn(AuthenticationException $e, Request $request) =>
            $request->is('api/*') ? $json('Unauthenticated.', 401) : null);

        $exceptions->render(fn(ThrottleRequestsException $e, Request $request) =>
            $request->is('api/*') ? $json('Too Many Attempts.', 429)->withHeaders($e->getHeaders()) : null);

        $exceptions->render(fn(UnauthorizedException $e, Request $request) =>
            $request->is('api/*') ? $json('This action is unauthorized.', 403) : null);

        // abort(403) sans message
        $exceptions->render(fn(AccessDeniedHttpException $e, Request $request) =>
            $request->is('api/*') && $e->getMessage() === '' ? $json('This action is unauthorized.', 403) : null);

        // abort(404) ou modèle introuvable (route model binding)
        $exceptions->render(fn(NotFoundHttpException $e, Request $request) =>
            $request->is('api/*') ? $json('Not Found', 404) : null);
    })->create();
