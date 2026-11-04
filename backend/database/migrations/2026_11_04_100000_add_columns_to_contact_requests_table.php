<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// La migration de création ne contenait que id + timestamps : on ajoute les vraies colonnes.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->string('nom')->default('');
            $table->string('email')->default('');
            $table->string('sujet')->default('');
            $table->text('message')->nullable();
            $table->boolean('lu')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropColumn(['nom', 'email', 'sujet', 'message', 'lu']);
        });
    }
};
