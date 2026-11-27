<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Mot de passe de l'admin : variable ADMIN_PASSWORD, sinon un mot de passe aléatoire affiché
        // une seule fois. Plus jamais « password » : il est connu de tous (dépôt public).
        $motDePasse = env('ADMIN_PASSWORD') ?: Str::password(16, symbols: false);
        if (! env('ADMIN_PASSWORD')) {
            $this->command?->warn("Mot de passe de admin@alhudaiki.ma : {$motDePasse} (à changer après la 1re connexion)");
        }

        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@alhudaiki.ma'],
            [
                'name' => 'Admin Al Hudaiki',
                'nom' => 'Al Hudaiki',
                'prenom' => 'Admin',
                'password' => Hash::make($motDePasse),
                'date_naissance' => '1985-01-01',
                'telephone' => '+212600000001',
                'statut' => 'actif',
            ]
        );
        $admin->assignRole('admin');

        // Lecteur de démonstration : jamais en production
        if (app()->isProduction()) {
            return;
        }

        $lecteur = User::firstOrCreate(
            ['email' => 'lecteur@test.ma'],
            [
                'name' => 'Ahmed Ben Ali',
                'nom' => 'Ben Ali',
                'prenom' => 'Ahmed',
                'password' => Hash::make('password'),
                'date_naissance' => '2000-05-15',
                'telephone' => '+212600000002',
                'cin' => 'AB123456',
                'adresse' => 'Tafraout, Maroc',
                'statut' => 'actif',
            ]
        );
        $lecteur->assignRole('lecteur');
    }
}