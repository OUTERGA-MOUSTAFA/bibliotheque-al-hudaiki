<?php

namespace Tests\Unit;

use App\Database\PostgresConnection;
use PHPUnit\Framework\TestCase;

// Avec les requêtes préparées émulées (pooler Neon), un booléen envoyé en 1/0 provoquait
// « operator does not exist: boolean = integer » (hero, messages non lus, masquer…).
class PostgresConnectionTest extends TestCase
{
    public function test_les_booleens_partent_en_true_false(): void
    {
        $connection = new PostgresConnection(fn() => null, 'test', '', ['name' => 'pgsql']);

        $this->assertSame(['true', 'false', 1, 'texte'], $connection->prepareBindings([true, false, 1, 'texte']));
    }
}
