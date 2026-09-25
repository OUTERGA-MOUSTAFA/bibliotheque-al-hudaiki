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

    public function handle() {
        Loan::whereNull('date_retour_reelle')
            ->where('date_retour_prevue', '<', now())
            ->with(['user','book'])
            ->each(function ($loan) {
                Mail::to($loan->user->email)->queue(new LateLoanMail($loan));
            });
        $this->info('Notifications envoyées.');
    }
}