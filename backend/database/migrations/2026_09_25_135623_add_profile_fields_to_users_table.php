<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nom')->after('id');
            $table->string('prenom')->after('nom');
            $table->date('date_naissance')->nullable()->after('prenom');
            $table->text('adresse')->nullable()->after('date_naissance');
            $table->string('telephone')->nullable()->after('adresse');
            $table->string('cin')->nullable()->unique()->after('telephone');
            $table->string('numero_massar')->nullable()->after('cin');
            $table->string('etablissement')->nullable()->after('numero_massar');
            $table->string('photo')->nullable()->after('etablissement');
            $table->enum('statut', ['actif', 'archive'])->default('actif')->after('photo');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nom','prenom','date_naissance','adresse','telephone',
                'cin','numero_massar','etablissement','photo','statut'
            ]);
        });
    }
};