<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titre = fake()->unique()->sentence(3);

        return [
            'titre' => $titre,
            'slug' => \Illuminate\Support\Str::slug($titre),
            'langue' => 'ar',
            'stock' => 2,
            'statut' => 'disponible',
            'max_borrow_days' => 14,
        ];
    }
}
