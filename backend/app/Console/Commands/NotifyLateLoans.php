<?php

namespace App\Console\Commands;

use App\Models\Loan;
use App\Mail\LateLoanMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class NotifyLateLoans extends Command
{
    protected $signature   = 'loans:notify-late';
    protected $description = 'Notifie les lecteurs en retard';

    // Jours de retard qui déclenchent un rappel, puis un rappel par semaine (14, 21, 28…).
    // Avant : un e-mail chaque jour, ce qui finit en courrier indésirable.
    public const JOURS_DE_RAPPEL = [1, 3, 7];

    public static function doitRelancer(int $joursDeRetard): bool
    {
        return in_array($joursDeRetard, self::JOURS_DE_RAPPEL, true)
            || ($joursDeRetard > 7 && $joursDeRetard % 7 === 0);
    }

    public function handle(): int
    {
        $count = 0;

        Loan::enRetard()
            ->with(['user', 'book'])
            ->chunkById(100, function ($loans) use (&$count) {
                foreach ($loans as $loan) {
                    if (!$loan->user?->email || !$loan->book) {
                        continue;
                    }
                    $retard = (int) $loan->date_retour_prevue->diffInDays(today());
                    if (!self::doitRelancer($retard)) {
                        continue;
                    }
                    // Mail::to($user) : l'e-mail part dans la langue préférée du lecteur
                    Mail::to($loan->user)->queue(new LateLoanMail($loan));
                    $count++;
                }
            });

        $this->info("{$count} notification(s) envoyée(s).");

        return self::SUCCESS;
    }
}
