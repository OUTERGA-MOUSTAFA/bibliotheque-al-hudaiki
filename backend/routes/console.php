<?php

use Illuminate\Support\Facades\Schedule;

// Exécuté par le service Railway « scheduler » (variable ROLE=scheduler → php artisan schedule:work).
// Heures exprimées à l'heure du Maroc. onOneServer : une seule exécution même avec plusieurs
// conteneurs (verrou dans le cache partagé, CACHE_STORE=database).

// Rappels aux lecteurs en retard (jours 1, 3, 7 puis chaque semaine)
Schedule::command('loans:notify-late')
    ->dailyAt('09:00')
    ->timezone('Africa/Casablanca')
    ->onOneServer()
    ->withoutOverlapping();

// Supprime de la base les tokens expirés (voir sanctum.expiration)
Schedule::command('sanctum:prune-expired --hours=24')
    ->dailyAt('03:00')
    ->timezone('Africa/Casablanca')
    ->onOneServer();

// Supprime les messages de contact jamais vérifiés depuis plus de 24 h
Schedule::command('model:prune', ['--model' => [App\Models\ContactRequest::class]])
    ->dailyAt('04:00')
    ->timezone('Africa/Casablanca')
    ->onOneServer();
