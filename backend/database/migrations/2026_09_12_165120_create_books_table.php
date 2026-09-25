<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('slug')->unique();
            $table->text('description')->nullable();     // ≤ 555
            $table->text('resume')->nullable();          // ≤ 1200
            $table->integer('nombre_pages')->nullable();
            $table->string('langue')->default('fr');
            $table->integer('stock')->default(1);
            $table->foreignId('categorie_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->enum('statut', ['disponible', 'emprunte', 'archive'])->default('disponible');
            $table->json('themes')->nullable();
            $table->json('personnes')->nullable();
            $table->json('lieux')->nullable();
            $table->json('periodes')->nullable();
            $table->string('image')->nullable();
            $table->decimal('note_moyenne', 3, 2)->default(0);
            $table->unsignedInteger('nb_favoris')->default(0);
            $table->unsignedInteger('nb_emprunts')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('books'); }
};