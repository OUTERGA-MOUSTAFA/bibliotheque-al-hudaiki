<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Garde-fou : RefreshDatabase efface tout. On refuse de tourner ailleurs que sur SQLite en mémoire.
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");
        if ($connection !== 'sqlite' || $database !== ':memory:') {
            throw new RuntimeException("Tests interdits sur la base [{$connection}:{$database}]. Lancez `php artisan config:clear`.");
        }
    }
}
