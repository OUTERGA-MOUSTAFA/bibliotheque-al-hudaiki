<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Index sur les colonnes utilisées dans les filtres et les jointures.
// PostgreSQL ne crée pas d'index automatiquement pour les clés étrangères :
// sans eux, chaque liste parcourt toute la table quand les données grossissent.
return new class extends Migration
{
    private const INDEX = [
        'books' => [['statut'], ['categorie_id'], ['nb_emprunts'], ['created_at']],
        'loans' => [['user_id'], ['book_id'], ['date_retour_reelle', 'date_retour_prevue']],
        'reviews' => [['book_id']],
        'favorites' => [['book_id']],
        'contact_requests' => [['lu']],
        'categories' => [['statut']],
        'users' => [['statut']],
    ];

    private function nom(string $table, array $colonnes): string
    {
        return $table . '_' . implode('_', $colonnes) . '_perf_index';
    }

    public function up(): void
    {
        foreach (self::INDEX as $table => $liste) {
            foreach ($liste as $colonnes) {
                // Idempotent : n'ajoute pas un index déjà présent (même colonnes)
                if (Schema::hasIndex($table, $colonnes)) {
                    continue;
                }
                Schema::table($table, fn(Blueprint $t) => $t->index($colonnes, $this->nom($table, $colonnes)));
            }
        }
    }

    public function down(): void
    {
        foreach (self::INDEX as $table => $liste) {
            foreach ($liste as $colonnes) {
                if (Schema::hasIndex($table, $this->nom($table, $colonnes))) {
                    Schema::table($table, fn(Blueprint $t) => $t->dropIndex($this->nom($table, $colonnes)));
                }
            }
        }
    }
};
