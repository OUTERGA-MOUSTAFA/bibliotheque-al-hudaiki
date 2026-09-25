<?php

namespace Database\Seeders;

use App\Models\Sponsor;
use Illuminate\Database\Seeder;

class SponsorSeeder extends Seeder
{
    public function run(): void
    {
        Sponsor::firstOrCreate(
            ['nom' => 'Mustapha Outerga'],
            [
                'logo' => 'https://portfolio-wwhz.vercel.app/og-image.png',
                'lien_externe' => 'https://portfolio-wwhz.vercel.app/',
                'ordre' => 1,
            ]
        );

        Sponsor::firstOrCreate(
            ['nom' => 'Commune de Tafraout'],
            [
                'logo' => 'https://via.placeholder.com/200x80/10b981/ffffff?text=Tafraout',
                'lien_externe' => 'https://www.tafraout.ma',
                'ordre' => 2,
            ]
        );
    }
}