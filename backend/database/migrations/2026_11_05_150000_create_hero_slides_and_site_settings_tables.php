<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Bannière de la page d'accueil gérée par l'admin :
// - hero_slides : images + textes en français et en arabe
// - site_settings : réglages simples (modèle d'affichage du hero, vitesse du carrousel…)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_slides', function (Blueprint $table) {
            $table->id();
            $table->string('image', 500);
            $table->string('badge_fr')->nullable();
            $table->string('badge_ar')->nullable();
            $table->string('titre_fr')->nullable();
            $table->string('titre_ar')->nullable();
            $table->text('sous_titre_fr')->nullable();
            $table->text('sous_titre_ar')->nullable();
            $table->string('bouton_fr', 60)->nullable();
            $table->string('bouton_ar', 60)->nullable();
            // Lien interne du site (ex. /catalogue?categorie=3) ou adresse externe https://…
            $table->string('lien', 500)->nullable();
            $table->unsignedInteger('ordre')->default(0);
            $table->boolean('actif')->default(true);
            $table->timestamps();

            $table->index(['actif', 'ordre']);
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->string('cle')->primary();
            $table->json('valeur')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('hero_slides');
    }
};
