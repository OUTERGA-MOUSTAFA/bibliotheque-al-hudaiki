<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@alhudaiki.ma'],
            [
                'name' => 'Admin Al Hudaiki',
                'nom' => 'Al Hudaiki',
                'prenom' => 'Admin',
                'password' => Hash::make('password'),
                'date_naissance' => '1985-01-01',
                'telephone' => '+212600000001',
                'statut' => 'actif',
            ]
        );
        $admin->assignRole('admin');

        // Lecteur test
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