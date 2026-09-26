<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Routing\Controller;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_books' => Book::count(),
            'available_books' => Book::where('stock', '>', 0)->count(),
            'active_loans' => Loan::whereNull('date_retour_reelle')->count(),
            'late_loans' => Loan::whereNull('date_retour_reelle')
                ->where('date_retour_prevue', '<', now())->count(),
            'total_users' => User::count(),
            'archived_users' => User::where('statut', 'archive')->count(),
        ];

        $recentLoans = Loan::with(['book', 'user'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_loans' => $recentLoans,
        ]);
    }

    public function users()
    {
        $users = User::with('roles')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($users);
    }

    public function archiveUser(User $user)
    {
        $user->update(['statut' => 'archive']);
        return response()->json(['message' => 'Utilisateur archivé']);
    }

    public function deleteUser(User $user)
    {
        $user->delete();
        return response()->noContent();
    }
}