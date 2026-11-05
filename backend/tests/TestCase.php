<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Garde-fou : RefreshDatabase lance « migrate:fresh », qui EFFACE toute la base.
     *
     * Le contrôle doit avoir lieu ici, dès la création de l'application, et non dans setUp() :
     * setUp() ne reprend la main qu'APRÈS RefreshDatabase. Un premier garde-fou placé là
     * a laissé une suite de tests vider la base Neon (configuration en cache, 05/11/2026).
     */
    public function createApplication(): Application
    {
        $app = parent::createApplication();

        // Configuration en cache : phpunit.xml est ignoré, la base réelle serait utilisée
        if ($app->configurationIsCached()) {
            throw new RuntimeException(
                'Tests refusés : la configuration est en cache (bootstrap/cache/config.php). '
                . 'Lancez `php artisan config:clear` puis relancez les tests.'
            );
        }

        // Autorisé : une base dont le nom finit par « _test », ou SQLite en mémoire
        $connection = $app['config']->get('database.default');
        $database = (string) $app['config']->get("database.connections.{$connection}.database");

        if (!str_ends_with($database, '_test') && $database !== ':memory:') {
            throw new RuntimeException(
                "Tests refusés sur la base [{$connection}:{$database}] : son nom doit finir par _test."
            );
        }

        return $app;
    }
}
