<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_books' => Book::count(),
            'available_books' => Book::disponible()->count(),
            'active_loans' => Loan::enCours()->count(),
            'late_loans' => Loan::enRetard()->count(),
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

    public function archiveUser(Request $request, User $user)
    {
        $this->ensureNotSelf($request, $user);

        $user->update(['statut' => 'archive']);
        // Un compte archivé ne doit plus pouvoir utiliser ses anciens tokens
        $user->tokens()->delete();

        return response()->json(['message' => 'Utilisateur archivé']);
    }

    public function restoreUser(User $user)
    {
        $user->update(['statut' => 'actif']);
        return response()->json(['message' => 'Utilisateur réactivé']);
    }

    public function deleteUser(Request $request, User $user)
    {
        $this->ensureNotSelf($request, $user);

        if ($user->loans()->enCours()->exists()) {
            abort(422, 'Cet utilisateur a encore des livres non rendus.');
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }

    private function ensureNotSelf(Request $request, User $user): void
    {
        if ($request->user()->is($user)) {
            abort(422, 'Vous ne pouvez pas effectuer cette action sur votre propre compte.');
        }
    }
}
