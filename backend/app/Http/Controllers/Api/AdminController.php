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

    // Liste paginée, avec recherche (nom, prénom, e-mail, téléphone) et filtre de statut
    public function users(Request $request)
    {
        $query = User::with('roles')->orderBy('created_at', 'desc');

        // Un tableau (?q[]=x) est ignoré au lieu de faire planter la requête
        if (is_string($request->input('q')) && trim($request->input('q')) !== '') {
            $q = mb_substr(trim($request->input('q')), 0, 100);
            $query->where(function ($w) use ($q) {
                $w->whereLike('nom', "%{$q}%")
                    ->orWhereLike('prenom', "%{$q}%")
                    ->orWhereLike('email', "%{$q}%")
                    ->orWhereLike('telephone', "%{$q}%");
            });
        }

        if (in_array($request->statut, ['actif', 'archive'], true)) {
            $query->where('statut', $request->statut);
        }

        $perPage = min(max((int) ($request->per_page ?: 24), 1), 100);

        return response()->json($query->paginate($perPage));
    }

    public function archiveUser(Request $request, User $user)
    {
        $this->ensureNotSelf($request, $user);

        $user->update(['statut' => 'archive']);
        // Un compte archivé ne doit plus pouvoir utiliser ses anciens tokens
        $user->tokens()->delete();

        return response()->json(['message' => __('Utilisateur archivé')]);
    }

    public function restoreUser(User $user)
    {
        $user->update(['statut' => 'actif']);
        return response()->json(['message' => __('Utilisateur réactivé')]);
    }

    public function deleteUser(Request $request, User $user)
    {
        $this->ensureNotSelf($request, $user);

        if ($user->loans()->enCours()->exists()) {
            abort(422, __('Cet utilisateur a encore des livres non rendus.'));
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }

    private function ensureNotSelf(Request $request, User $user): void
    {
        if ($request->user()->is($user)) {
            abort(422, __('Vous ne pouvez pas effectuer cette action sur votre propre compte.'));
        }
    }
}
