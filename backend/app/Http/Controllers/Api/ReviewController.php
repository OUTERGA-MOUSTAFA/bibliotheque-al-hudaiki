<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ReviewController extends Controller
{
    // Créer ou modifier son avis (un seul avis par lecteur et par livre)
    public function store(Request $request, Book $book)
    {
        $user = $request->user();

        // On ne note que ce qu'on a réellement emprunté
        if (!$user->loans()->where('book_id', $book->id)->exists()) {
            abort(403, "Vous devez avoir emprunté ce livre pour le noter.");
        }

        $validated = $request->validate([
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        $review = Review::updateOrCreate(
            ['user_id' => $user->id, 'book_id' => $book->id],
            $validated
        );

        $this->recalculerNote($book);

        return response()->json($review->load('user:id,nom,prenom,photo'), $review->wasRecentlyCreated ? 201 : 200);
    }

    // Supprimer un avis : son auteur ou un admin
    public function destroy(Request $request, Review $review)
    {
        $user = $request->user();

        if ($review->user_id !== $user->id && !$user->hasRole('admin')) {
            abort(403);
        }

        $book = $review->book;
        $review->delete();

        if ($book) {
            $this->recalculerNote($book);
        }

        return response()->noContent();
    }

    // Les avis du lecteur connecté
    public function mine(Request $request)
    {
        return response()->json([
            'data' => $request->user()->reviews()->with('book:id,titre,slug,image')->latest()->get(),
        ]);
    }

    private function recalculerNote(Book $book): void
    {
        $book->update(['note_moyenne' => round((float) $book->reviews()->avg('note'), 2)]);
    }
}
