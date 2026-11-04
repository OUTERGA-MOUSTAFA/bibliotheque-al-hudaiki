<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// La migration de création ne contenait que id + timestamps : on ajoute les vraies colonnes.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('book_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('note')->default(5);
            $table->text('commentaire')->nullable();
            $table->unique(['user_id', 'book_id']);
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'book_id']);
            $table->dropConstrainedForeignId('user_id');
            $table->dropConstrainedForeignId('book_id');
            $table->dropColumn(['note', 'commentaire']);
        });
    }
};
