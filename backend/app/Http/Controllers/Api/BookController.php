<?php
namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Http\Requests\StoreBookRequest;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $r) {
        $books = Book::query()
            ->when($r->q, fn($q) => $q->whereRaw(
                "to_tsvector('french', titre || ' ' || coalesce(resume,'')) @@ plainto_tsquery(?)", [$r->q]))
            ->when($r->categorie, fn($q) => $q->where('categorie_id', $r->categorie))
            ->when($r->langue, fn($q) => $q->where('langue', $r->langue))
            ->when($r->disponible, fn($q) => $q->disponible())
            ->when($r->tri === 'populaire', fn($q) => $q->populaire())
            ->when($r->tri === 'recent', fn($q) => $q->latest())
            ->when($r->tri === 'alpha', fn($q) => $q->orderBy('titre'))
            ->paginate(12);
        return BookResource::collection($books);
    }

    public function show(Book $book) { return new BookResource($book->load('categorie','reviews')); }

    public function store(StoreBookRequest $r) {
        $book = Book::create($r->validated() + ['slug' => \Str::slug($r->titre)]);
        return new BookResource($book);
    }

    public function update(StoreBookRequest $r, Book $book) {
        $book->update($r->validated());
        return new BookResource($book);
    }

    public function destroy(Book $book) { $book->delete(); return response()->noContent(); }

    public function archive(Book $book) {
        $book->update(['statut' => 'archive']);
        return new BookResource($book);
    }
}