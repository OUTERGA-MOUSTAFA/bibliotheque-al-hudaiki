<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;

class BookController extends Controller
{
    private const IMAGE_PAR_DEFAUT = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop';

    // Public : les livres archivés ne sont jamais visibles
    public function index(Request $request)
    {
        $query = Book::with('categorie')->where('statut', '!=', 'archive');

        if (in_array($request->statut, ['disponible', 'emprunte'], true)) {
            $query->where('statut', $request->statut);
        }

        return response()->json($this->filtrer($query, $request)->paginate($this->perPage($request)));
    }

    // Admin : tous les livres, archivés compris (filtre ?statut=archive possible)
    public function adminIndex(Request $request)
    {
        $query = Book::with('categorie');

        if (in_array($request->statut, ['disponible', 'emprunte', 'archive'], true)) {
            $query->where('statut', $request->statut);
        }

        return response()->json($this->filtrer($query, $request)->paginate($this->perPage($request)));
    }

    public function show(Book $book)
    {
        abort_if($book->statut === 'archive', 404);

        $book->load(['categorie', 'reviews.user:id,nom,prenom,photo']);
        return response()->json($book);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string|max:555',
            'resume' => 'nullable|string|max:1200',
            'nombre_pages' => 'nullable|integer|min:1',
            'langue' => 'nullable|string|max:5',
            'stock' => 'required|integer|min:0',
            'max_borrow_days' => 'required|integer|min:1|max:365',
            'age_restriction' => 'nullable|integer|min:0|max:120',
            'categorie_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:5120',
        ]);

        $validated['slug'] = $this->slugUnique($validated['titre']);
        $validated['langue'] = $validated['langue'] ?? 'ar';
        $validated['statut'] = $validated['stock'] > 0 ? 'disponible' : 'emprunte';
        $validated['image'] = $request->hasFile('image')
            ? $this->uploadImage($request->file('image'))
            : self::IMAGE_PAR_DEFAUT;

        $book = Book::create($validated);

        return response()->json($book->load('categorie'), 201);
    }

    // PUT JSON, ou POST multipart avec _method=PUT pour changer l'image
    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:555',
            'resume' => 'nullable|string|max:1200',
            'nombre_pages' => 'nullable|integer|min:1',
            'langue' => 'sometimes|string|max:5',
            'stock' => 'sometimes|integer|min:0',
            'max_borrow_days' => 'sometimes|integer|min:1|max:365',
            'age_restriction' => 'nullable|integer|min:0|max:120',
            'categorie_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:5120',
        ]);

        if (isset($validated['titre']) && $validated['titre'] !== $book->titre) {
            $validated['slug'] = $this->slugUnique($validated['titre'], $book->id);
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $this->uploadImage($request->file('image'));
        } else {
            unset($validated['image']);
        }

        // Le statut suit le stock (sauf si le livre est archivé)
        if (isset($validated['stock']) && $book->statut !== 'archive') {
            $validated['statut'] = $validated['stock'] > 0 ? 'disponible' : 'emprunte';
        }

        $book->update($validated);

        return response()->json($book->load('categorie'));
    }

    public function archive(Book $book)
    {
        $book->update(['statut' => 'archive']);
        return response()->json($book);
    }

    public function restore(Book $book)
    {
        $book->update(['statut' => $book->stock > 0 ? 'disponible' : 'emprunte']);
        return response()->json(['message' => 'Livre restauré', 'book' => $book]);
    }

    public function destroy(Book $book)
    {
        if ($book->loans()->whereNull('date_retour_reelle')->exists()) {
            abort(422, 'Ce livre a des exemplaires non rendus : archivez-le plutôt.');
        }

        $book->delete();
        return response()->noContent();
    }

    // ───────────────────────── Helpers ─────────────────────────

    private function filtrer($query, Request $request)
    {
        if ($request->filled('q')) {
            $search = $request->q;
            // whereLike = insensible à la casse (ILIKE sur PostgreSQL)
            $query->where(function ($q) use ($search) {
                $q->whereLike('titre', "%{$search}%")
                    ->orWhereLike('resume', "%{$search}%")
                    ->orWhereLike('description', "%{$search}%");
            });
        }
        if ($request->filled('categorie')) $query->where('categorie_id', $request->categorie);
        if ($request->filled('langue')) $query->where('langue', $request->langue);
        if ($request->disponible === 'true') $query->where('stock', '>', 0);

        match ($request->tri) {
            'populaire' => $query->orderByDesc('nb_emprunts'),
            'alpha' => $query->orderBy('titre'),
            default => $query->latest(),
        };

        return $query;
    }

    private function perPage(Request $request): int
    {
        return min(max((int) ($request->per_page ?: 12), 1), 50);
    }

    private function slugUnique(string $titre, ?int $ignoreId = null): string
    {
        $base = Str::slug($titre) ?: 'livre';
        $slug = $base;
        $i = 2;

        while (Book::withTrashed()
            ->where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function uploadImage(UploadedFile $file): string
    {
        try {
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => config('services.cloudinary.cloud_name'),
                    'api_key' => config('services.cloudinary.api_key'),
                    'api_secret' => config('services.cloudinary.api_secret'),
                ],
                'url' => ['secure' => true],
            ]);

            $upload = (new UploadApi())->upload($file->getRealPath(), ['folder' => 'al-hudaiki/books']);
            return $upload['secure_url'];
        } catch (\Throwable $e) {
            // Le détail reste dans les logs, jamais renvoyé au client
            Log::error('Upload Cloudinary échoué', ['error' => $e->getMessage()]);
            abort(502, "L'envoi de l'image a échoué. Réessayez plus tard.");
        }
    }
}
