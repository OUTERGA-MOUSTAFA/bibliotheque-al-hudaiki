<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with('book.categorie')
            ->latest()
            ->get();

        return response()->json([
            // filter() : retire les favoris dont le livre a été supprimé
            'data' => $favorites->map(fn($f) => $f->book)->filter()->values(),
        ]);
    }

    public function toggle(Request $request, Book $book)
    {
        $user = $request->user();

        $existing = Favorite::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        if ($existing) {
            $existing->delete();
            // nb_favoris est unsigned : on ne descend jamais sous 0
            if ($book->nb_favoris > 0) {
                $book->decrement('nb_favoris');
            }
            return response()->json(['favorited' => false]);
        }

        Favorite::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
        ]);
        $book->increment('nb_favoris');

        return response()->json(['favorited' => true]);
    }
}
