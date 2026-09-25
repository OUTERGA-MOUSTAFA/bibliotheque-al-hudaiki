<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['nom' => 'أدب عربي',       'slug' => 'adab-arabi',      'description' => 'روايات وأشعار عربية'],
            ['nom' => 'أدب فرنسي',       'slug' => 'adab-faransi',    'description' => 'Littérature française'],
            ['nom' => 'كتب الأطفال',     'slug' => 'kotob-atfal',     'description' => 'قصص وحكايات للصغار'],
            ['nom' => 'تاريخ',           'slug' => 'tarikh',          'description' => 'كتب تاريخية'],
            ['nom' => 'علوم',            'slug' => 'oloum',           'description' => 'Sciences et techniques'],
            ['nom' => 'فلسفة',           'slug' => 'falsafa',         'description' => 'Philosophie et pensée'],
            ['nom' => 'دين',             'slug' => 'din',             'description' => 'كتب دينية'],
            ['nom' => 'تنمية ذاتية',     'slug' => 'tanmiya-datiya',  'description' => 'Développement personnel'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}