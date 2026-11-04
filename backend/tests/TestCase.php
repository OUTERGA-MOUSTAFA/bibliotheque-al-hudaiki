<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Garde-fou : RefreshDatabase efface tout. On refuse de tourner sur la base de l'application.
        // Autorisé : une base PostgreSQL dont le nom finit par "_test", ou SQLite en mémoire.
        $connection = config('database.default');
        $database = (string) config("database.connections.{$connection}.database");
        $isTestDatabase = str_ends_with($database, '_test') || $database === ':memory:';

        if (!$isTestDatabase) {
            throw new RuntimeException(
                "Tests interdits sur la base [{$connection}:{$database}] : son nom doit finir par _test. "
                . "Si la config est en cache, lancez `php artisan config:clear`."
            );
        }
    }
}
