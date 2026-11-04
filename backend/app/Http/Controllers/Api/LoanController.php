<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    // Nombre maximum de livres empruntés en même temps par un lecteur
    private const MAX_PRETS_SIMULTANES = 3;

    // Mes emprunts (lecteur)
    public function myLoans(Request $request)
    {
        $loans = $request->user()
            ->loans()
            ->with('book')
            ->latest()
            ->get()
            ->map(fn(Loan $loan) => [
                'id' => $loan->id,
                'book' => $loan->book,
                'date_pret' => $loan->date_pret?->toDateString(),
                'date_retour_prevue' => $loan->date_retour_prevue?->toDateString(),
                'date_retour_reelle' => $loan->date_retour_reelle?->toDateString(),
                'statut' => $this->statut($loan),
                'jours_restants' => $loan->date_retour_reelle ? null
                    : max(0, (int) today()->diffInDays($loan->date_retour_prevue, false)),
                'jours_retard' => $loan->date_retour_reelle ? null : $this->joursRetard($loan),
            ]);

        return response()->json(['data' => $loans]);
    }

    // Emprunt par le lecteur connecté
    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|integer|exists:books,id',
            'borrow_duration' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $book = Book::lockForUpdate()->findOrFail($validated['book_id']);
            $user = $request->user();

            if ($user->statut !== 'actif') {
                abort(403, "Votre compte est archivé.");
            }

            if ($book->statut === 'archive') {
                abort(422, "Ce livre n'est plus disponible.");
            }

            // 🛡️ Restriction d'âge
            if ($book->age_restriction && $user->age < $book->age_restriction) {
                abort(403, "Vous n'avez pas l'âge requis pour emprunter ce livre.");
            }

            if ($book->stock < 1) {
                abort(422, "Livre indisponible.");
            }

            $enCours = $user->loans()->enCours();

            if ((clone $enCours)->where('book_id', $book->id)->exists()) {
                abort(422, "Vous avez déjà emprunté ce livre.");
            }

            if ((clone $enCours)->whereDate('date_retour_prevue', '<', today())->exists()) {
                abort(422, "Vous avez un livre en retard. Merci de le rendre avant un nouvel emprunt.");
            }

            if ($enCours->count() >= self::MAX_PRETS_SIMULTANES) {
                abort(422, "Vous avez atteint le maximum de " . self::MAX_PRETS_SIMULTANES . " emprunts en cours.");
            }

            // 📅 Durée choisie par le lecteur, plafonnée par la limite fixée par l'admin
            $maxJours = $book->max_borrow_days ?? 14;
            if ($validated['borrow_duration'] > $maxJours) {
                abort(422, "La durée maximale pour ce livre est de {$maxJours} jours.");
            }

            $loan = Loan::create([
                'book_id' => $book->id,
                'user_id' => $user->id,
                'date_pret' => today(),
                'date_retour_prevue' => today()->addDays($validated['borrow_duration']),
            ]);

            $book->decrement('stock');
            $book->increment('nb_emprunts');
            if ($book->stock <= 0) {
                $book->update(['statut' => 'emprunte']);
            }

            return response()->json($loan->load('book'), 201);
        });
    }

    // Admin : liste des prêts en cours
    public function index()
    {
        $loans = Loan::with(['book', 'user'])
            ->enCours()
            ->orderBy('date_retour_prevue')
            ->get()
            ->map(fn(Loan $l) => [
                'id' => $l->id,
                'lecteur' => $l->user ? [
                    'id' => $l->user->id,
                    'nom' => $l->user->nom,
                    'prenom' => $l->user->prenom,
                    'photo' => $l->user->photo,
                    'telephone' => $l->user->telephone,
                ] : null,
                'livre' => $l->book ? [
                    'id' => $l->book->id,
                    'titre' => $l->book->titre,
                    'image' => $l->book->image,
                ] : null,
                'date_pret' => $l->date_pret?->toDateString(),
                'date_retour_prevue' => $l->date_retour_prevue?->toDateString(),
                'jours_retard' => $this->joursRetard($l),
            ]);

        return response()->json(['data' => $loans]);
    }

    // Admin : enregistrer le retour d'un livre
    public function returnBook(Loan $loan)
    {
        if ($loan->date_retour_reelle) {
            abort(422, "Ce livre a déjà été rendu.");
        }

        return DB::transaction(function () use ($loan) {
            $loan->update(['date_retour_reelle' => today()]);
            $this->rendreAuStock($loan);

            return response()->json(['message' => 'Livre retourné', 'loan' => $loan->fresh('book')]);
        });
    }

    // Admin : supprimer un prêt (erreur de saisie). Rend le stock si le livre n'était pas rendu.
    public function destroy(Loan $loan)
    {
        DB::transaction(function () use ($loan) {
            if (!$loan->date_retour_reelle) {
                $this->rendreAuStock($loan);
            }
            $loan->delete();
        });

        return response()->noContent();
    }

    private function rendreAuStock(Loan $loan): void
    {
        $book = Book::withTrashed()->lockForUpdate()->find($loan->book_id);
        if (!$book) return;

        $book->increment('stock');
        // Un livre archivé reste archivé même après le retour
        if ($book->statut === 'emprunte') {
            $book->update(['statut' => 'disponible']);
        }
    }

    private function joursRetard(Loan $loan): int
    {
        return max(0, (int) $loan->date_retour_prevue->diffInDays(today(), false));
    }

    private function statut(Loan $loan): string
    {
        if ($loan->date_retour_reelle) return 'retourné';
        return $loan->date_retour_prevue->lt(today()) ? 'en retard' : 'en cours';
    }
}
