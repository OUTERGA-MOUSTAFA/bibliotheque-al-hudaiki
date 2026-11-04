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
                    Mail::to($loan->user->email)->queue(new LateLoanMail($loan));
                    $count++;
                }
            });

        $this->info("{$count} notification(s) envoyée(s).");

        return self::SUCCESS;
    }
}
