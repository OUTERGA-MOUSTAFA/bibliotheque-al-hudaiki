<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $adabArabe = Category::where('slug', 'adab-arabi')->first();
        $kotobAtfal = Category::where('slug', 'kotob-atfal')->first();
        $tarikh = Category::where('slug', 'tarikh')->first();

        $books = [
            [
                'titre' => 'موسم الهجرة إلى الشمال',
                'description' => 'رواية خالدة للطيب صالح، تتناول قضايا الهوية والاغتراب.',
                'resume' => 'تدور أحداث الرواية حول مصطفى سعيد، الشخصية المحورية التي تعيش صراعاً بين الشرق والغرب، بين الجذور والمنفى.',
                'nombre_pages' => 180,
                'langue' => 'ar',
                'stock' => 5,
                'categorie_id' => $adabArabe?->id,
                'image' => 'https://covers.openlibrary.org/b/isbn/9789953890758-L.jpg',
                'themes' => ['هوية', 'اغتراب', 'استعمار'],
                'note_moyenne' => 4.5,
                'nb_emprunts' => 12,
            ],
            [
                'titre' => 'الأيام',
                'description' => 'سيرة ذاتية للأديب طه حسين.',
                'resume' => 'يتحدث طه حسين عن طفولته في الريف المصري، وعن فقدانه البصر، ورحلته في طلب العلم.',
                'nombre_pages' => 240,
                'langue' => 'ar',
                'stock' => 3,
                'categorie_id' => $adabArabe?->id,
                'image' => 'https://covers.openlibrary.org/b/isbn/9789770932312-L.jpg',
                'themes' => ['سيرة', 'تعليم', 'صعيد مصر'],
                'note_moyenne' => 4.8,
                'nb_emprunts' => 18,
            ],
            [
                'titre' => 'Le Petit Prince',
                'description' => 'Un conte poétique et philosophique sous l\'apparence d\'un livre pour enfants.',
                'resume' => 'Le narrateur rencontre un petit prince dans le désert du Sahara. Un voyage initiatique sur l\'amitié et le sens de la vie.',
                'nombre_pages' => 96,
                'langue' => 'fr',
                'stock' => 8,
                'categorie_id' => $kotobAtfal?->id,
                'image' => 'https://covers.openlibrary.org/b/isbn/9782070612758-L.jpg',
                'themes' => ['enfance', 'amitié', 'philosophie'],
                'note_moyenne' => 5.0,
                'nb_emprunts' => 45,
            ],
            [
                'titre' => 'حكايات جدتي',
                'description' => 'مجموعة من الحكايات الشعبية المغربية للأطفال.',
                'resume' => 'حكايات تراثية من المغرب العميق، تُروى بأسلوب شيق للأطفال، مليئة بالحكمة والخيال.',
                'nombre_pages' => 120,
                'langue' => 'ar',
                'stock' => 10,
                'categorie_id' => $kotobAtfal?->id,
                'image' => 'https://covers.openlibrary.org/b/isbn/9789953264146-L.jpg',
                'themes' => ['تراث', 'طفولة', 'مغرب'],
                'note_moyenne' => 4.7,
                'nb_emprunts' => 30,
            ],
            [
                'titre' => 'تاريخ المغرب',
                'description' => 'من العصور القديمة إلى العصر الحديث.',
                'resume' => 'كتاب شامل يتناول تاريخ المغرب منذ الفينيقيين حتى اليوم، بمنهج علمي وأسلوب سهل.',
                'nombre_pages' => 450,
                'langue' => 'ar',
                'stock' => 2,
                'categorie_id' => $tarikh?->id,
                'image' => 'https://covers.openlibrary.org/b/isbn/9789954472700-L.jpg',
                'themes' => ['تاريخ', 'مغرب', 'دول'],
                'note_moyenne' => 4.6,
                'nb_emprunts' => 8,
            ],
        ];

        foreach ($books as $book) {
            Book::firstOrCreate(
                ['slug' => Str::slug($book['titre'], '-', 'ar')],
                array_merge($book, ['slug' => Str::slug($book['titre'], '-', 'ar')])
            );
        }
    }
}