<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Vérification de l'adresse e-mail des messages de contact :
// le visiteur reçoit un code à 6 chiffres ; le message n'arrive à l'admin qu'une fois le code saisi.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            // Identifiant public du message (dans le lien de l'e-mail) : pas d'id séquentiel devinable
            $table->string('verification_token', 64)->nullable()->unique()->after('lu');
            $table->string('verification_code_hash')->nullable()->after('verification_token');
            $table->timestamp('verification_expires_at')->nullable()->after('verification_code_hash');
            $table->unsignedTinyInteger('verification_attempts')->default(0)->after('verification_expires_at');
            $table->timestamp('verified_at')->nullable()->index()->after('verification_attempts');
            $table->string('locale', 2)->default('fr')->after('verified_at');
        });

        // Les messages reçus avant cette fonctionnalité restent visibles dans l'administration
        DB::table('contact_requests')->whereNull('verified_at')->update(['verified_at' => DB::raw('created_at')]);
    }

    public function down(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropUnique(['verification_token']);
            $table->dropIndex(['verified_at']);
            $table->dropColumn(['verification_token', 'verification_code_hash', 'verification_expires_at', 'verification_attempts', 'verified_at', 'locale']);
        });
    }
};
