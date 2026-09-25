<?php
namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Loan;
use App\Models\User;
use App\Http\Requests\StoreLoanRequest;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoanController extends Controller
{
    public function index(Request $r) {
        return Loan::with(['book','user'])
            ->whereNull('date_retour_reelle')
            ->orderBy('date_retour_prevue')
            ->get()
            ->map(fn($l) => [
                'id' => $l->id,
                'lecteur' => [
                    'nom' => $l->user->nom, 'prenom' => $l->user->prenom,
                    'photo' => $l->user->photo, 'telephone' => $l->user->telephone,
                ],
                'livre' => ['titre' => $l->book->titre, 'image' => $l->book->image],
                'date_pret' => $l->date_pret,
                'date_retour_prevue' => $l->date_retour_prevue,
                'jours_retard' => max(0, Carbon::parse($l->date_retour_prevue)->diffInDays(now(), false)),
                'retards_precedents' => $l->user->loans()->whereNotNull('jours_retard')->count(),
            ]);
    }

    public function store(StoreLoanRequest $r) {
        return DB::transaction(function () use ($r) {
            $book = Book::lockForUpdate()->findOrFail($r->book_id);
            abort_if($book->stock < 1, 422, 'Livre indisponible.');

            $loan = Loan::create($r->validated());
            $book->decrement('stock');
            $book->increment('nb_emprunts');
            if ($book->stock === 0) $book->update(['statut' => 'emprunte']);

            return response()->json($loan->load('book','user'), 201);
        });
    }

    public function return(Loan $loan) {
        return DB::transaction(function () use ($loan) {
            $loan->update(['date_retour_reelle' => now()]);
            $loan->book->increment('stock');
            $loan->book->update(['statut' => 'disponible']);
            return response()->json($loan);
        });
    }

    public function destroy(Loan $loan) { $loan->delete(); return response()->noContent(); }
}