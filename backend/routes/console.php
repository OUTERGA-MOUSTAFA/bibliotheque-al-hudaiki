<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('loans:notify-late')->dailyAt('09:00');

// Supprime de la base les tokens expirés (voir sanctum.expiration)
Schedule::command('sanctum:prune-expired --hours=24')->daily();
