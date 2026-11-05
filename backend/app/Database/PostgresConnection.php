<?php

namespace App\Database;

use Illuminate\Database\PostgresConnection as BasePostgresConnection;

/**
 * Connexion PostgreSQL compatible avec les requêtes préparées émulées (pooler Neon).
 *
 * Laravel convertit les booléens en 1/0 avant de les envoyer. Avec l'émulation, la valeur
 * est écrite telle quelle dans le SQL (« actif = 1 ») et PostgreSQL refuse :
 * « operator does not exist: boolean = integer ». On les envoie en 'true'/'false',
 * que PostgreSQL accepte pour une colonne boolean.
 */
class PostgresConnection extends BasePostgresConnection
{
    public function prepareBindings(array $bindings)
    {
        foreach ($bindings as $key => $value) {
            if (is_bool($value)) {
                $bindings[$key] = $value ? 'true' : 'false';
            }
        }

        return parent::prepareBindings($bindings);
    }
}
