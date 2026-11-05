<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Catégories bilingues : chaque nom et description existe en français et en arabe.
// Les colonnes « nom » et « description » restent comme valeur de secours.
return new class extends Migration
{
    // Traductions des catégories créées par le seeder (identifiées par leur slug)
    private const KNOWN = [
        'adab-arabi' => ['Littérature arabe', 'أدب عربي', 'Romans et poésie arabes', 'روايات وأشعار عربية'],
        'adab-faransi' => ['Littérature française', 'أدب فرنسي', 'Romans et œuvres de la littérature française', 'روايات وأعمال من الأدب الفرنسي'],
        'kotob-atfal' => ['Livres pour enfants', 'كتب الأطفال', 'Contes et histoires pour les petits', 'قصص وحكايات للصغار'],
        'tarikh' => ['Histoire', 'تاريخ', 'Livres d’histoire', 'كتب تاريخية'],
        'oloum' => ['Sciences', 'علوم', 'Sciences et techniques', 'علوم وتقنيات'],
        'falsafa' => ['Philosophie', 'فلسفة', 'Philosophie et pensée', 'فلسفة وفكر'],
        'din' => ['Religion', 'دين', 'Livres religieux', 'كتب دينية'],
        'tanmiya-datiya' => ['Développement personnel', 'تنمية ذاتية', 'Développement personnel', 'تنمية ذاتية وتطوير الذات'],
    ];

    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('nom_fr')->nullable()->after('nom');
            $table->string('nom_ar')->nullable()->after('nom_fr');
            $table->text('description_fr')->nullable()->after('description');
            $table->text('description_ar')->nullable()->after('description_fr');
        });

        $isArabic = fn(?string $s) => $s !== null && preg_match('/\p{Arabic}/u', $s);

        foreach (DB::table('categories')->get() as $cat) {
            [$nomFr, $nomAr, $descFr, $descAr] = self::KNOWN[$cat->slug] ?? [null, null, null, null];

            // Sinon : la valeur existante va dans la colonne de sa langue (détectée à l'écriture)
            $nomFr ??= $isArabic($cat->nom) ? null : $cat->nom;
            $nomAr ??= $isArabic($cat->nom) ? $cat->nom : null;
            $descFr ??= $cat->description && !$isArabic($cat->description) ? $cat->description : null;
            $descAr ??= $cat->description && $isArabic($cat->description) ? $cat->description : null;

            DB::table('categories')->where('id', $cat->id)->update([
                'nom_fr' => $nomFr,
                'nom_ar' => $nomAr,
                'description_fr' => $descFr,
                'description_ar' => $descAr,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['nom_fr', 'nom_ar', 'description_fr', 'description_ar']);
        });
    }
};
