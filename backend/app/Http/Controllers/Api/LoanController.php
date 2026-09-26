<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoanController extends Controller
{
    // Mes emprunts (lecteur)
    public function myLoans(Request $request)
    {
        $loans = $request->user()
            ->loans()
            ->with('book')
            ->latest()
            ->get()
            ->map(fn($loan) => [
                'id' => $loan->id,
                'book' => $loan->book,
                'date_pret' => $loan->date_pret,
                'date_retour_prevue' => $loan->date_retour_prevue,
                'date_retour_reelle' => $loan->date_retour_reelle,
                'statut' => $loan->date_retour_reelle ? 'retourné' :
                           (Carbon::parse($loan->date_retour_prevue)->isPast() ? 'en retard' : 'en cours'),
                'jours_restants' => $loan->date_retour_reelle ? null :
                    max(0, now()->diffInDays(Carbon::parse($loan->date_retour_prevue), false)),
                'jours_retard' => $loan->date_retour_reelle ? null :
                    max(0, Carbon::parse($loan->date_retour_prevue)->diffInDays(now(), false)),
            ]);

        return response()->json(['data' => $loans]);
    }

    // Créer un emprunt (admin only via /admin, mais b3d kayn pour usage interne)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'user_id' => 'required|exists:users,id',
            'date_pret' => 'required|date',
            'date_retour_prevue' => 'required|date|after:date_pret',
        ]);

        return DB::transaction(function () use ($validated) {
            $book = Book::lockForUpdate()->findOrFail($validated['book_id']);

            if ($book->stock < 1) {
                abort(422, 'Livre indisponible.');
            }

            $loan = Loan::create($validated);

            $book->decrement('stock');
            $book->increment('nb_emprunts');
            if ($book->stock === 0) {
                $book->update(['statut' => 'emprunte']);
            }

            return response()->json($loan->load('book', 'user'), 201);
        });
    }

    // Admin: liste tous les prêts en cours
    public function index()
    {
        $loans = Loan::with(['book', 'user'])
            ->whereNull('date_retour_reelle')
            ->orderBy('date_retour_prevue')
            ->get()
            ->map(fn($l) => [
                'id' => $l->id,
                'lecteur' => [
                    'id' => $l->user->id,
                    'nom' => $l->user->nom,
                    'prenom' => $l->user->prenom,
                    'photo' => $l->user->photo,
                    'telephone' => $l->user->telephone,
                ],
                'livre' => [
                    'id' => $l->book->id,
                    'titre' => $l->book->titre,
                    'image' => $l->book->image,
                ],
                'date_pret' => $l->date_pret,
                'date_retour_prevue' => $l->date_retour_prevue,
                'jours_retard' => max(0, Carbon::parse($l->date_retour_prevue)->diffInDays(now(), false)),
            ]);

        return response()->json(['data' => $loans]);
    }

    public function returnBook(Loan $loan)
    {
        return DB::transaction(function () use ($loan) {
            $loan->update(['date_retour_reelle' => now()]);
            $loan->book->increment('stock');
            $loan->book->update(['statut' => 'disponible']);
            return response()->json(['message' => 'Livre retourné', 'loan' => $loan]);
        });
    }

    public function destroy(Loan $loan)
    {
        $loan->delete();
        return response()->noContent();
    }
}