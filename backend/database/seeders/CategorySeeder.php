<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // [slug, nom FR, nom AR, description FR, description AR]
        $categories = [
            ['adab-arabi', 'Littérature arabe', 'أدب عربي', 'Romans et poésie arabes', 'روايات وأشعار عربية'],
            ['adab-faransi', 'Littérature française', 'أدب فرنسي', 'Romans et œuvres de la littérature française', 'روايات وأعمال من الأدب الفرنسي'],
            ['kotob-atfal', 'Livres pour enfants', 'كتب الأطفال', 'Contes et histoires pour les petits', 'قصص وحكايات للصغار'],
            ['tarikh', 'Histoire', 'تاريخ', 'Livres d’histoire', 'كتب تاريخية'],
            ['oloum', 'Sciences', 'علوم', 'Sciences et techniques', 'علوم وتقنيات'],
            ['falsafa', 'Philosophie', 'فلسفة', 'Philosophie et pensée', 'فلسفة وفكر'],
            ['din', 'Religion', 'دين', 'Livres religieux', 'كتب دينية'],
            ['tanmiya-datiya', 'Développement personnel', 'تنمية ذاتية', 'Développement personnel', 'تنمية ذاتية وتطوير الذات'],
        ];

        foreach ($categories as [$slug, $nomFr, $nomAr, $descFr, $descAr]) {
            Category::firstOrCreate(['slug' => $slug], [
                'nom_fr' => $nomFr,
                'nom_ar' => $nomAr,
                'description_fr' => $descFr,
                'description_ar' => $descAr,
            ]);
        }
    }
}
