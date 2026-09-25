<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('loans:notify-late')->dailyAt('09:00');
