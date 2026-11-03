<?php

namespace App\Http\Controllers\Api;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with('categorie');

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")->orWhere('resume', 'like', "%{$search}%");
            });
        }
        if ($request->filled('categorie')) $query->where('categorie_id', $request->categorie);
        if ($request->filled('langue')) $query->where('langue', $request->langue);
        if ($request->filled('disponible') && $request->disponible === 'true') $query->where('stock', '>', 0);
        if ($request->filled('statut')) $query->where('statut', $request->statut);

        if ($request->filled('tri')) {
            if ($request->tri === 'populaire') $query->orderByDesc('nb_emprunts');
            if ($request->tri === 'alpha') $query->orderBy('titre');
            if ($request->tri === 'recent') $query->latest();
        } else {
            $query->latest();
        }

        return response()->json($query->paginate($request->per_page ?? 12));
    }

    public function show(Book $book)
    {
        $book->load(['categorie', 'reviews.user']);
        return response()->json($book);
    }

    // 👇 L'Ajout dial l'Ktab (L'Admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string|max:555',
            'resume' => 'nullable|string|max:1200',
            'nombre_pages' => 'nullable|integer',
            'langue' => 'nullable|string|max:5',
            'stock' => 'required|integer|min:0',
            'max_borrow_days' => 'required|integer|min:1',
            'age_restriction' => 'nullable|integer|min:0',
            'categorie_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:5120',
        ]);

        $validated['slug'] = Str::slug($validated['titre']) ?: 'book-' . time();

        if (empty($validated['categorie_id']) || !Category::find($validated['categorie_id'])) {
            $validated['categorie_id'] = null;
        }

        $validated['langue'] = $validated['langue'] ?? 'ar';
        $validated['statut'] = 'disponible';

        // 📸 ☁️ L'UPLOAD L'CLOUDINARY
        if ($request->hasFile('image')) {
            try {
                $cloudName = config('services.cloudinary.cloud_name');
                $apiKey    = config('services.cloudinary.api_key');
                $apiSecret = config('services.cloudinary.api_secret');

                Configuration::instance([
                    'cloud' => ['cloud_name' => $cloudName, 'api_key' => $apiKey, 'api_secret' => $apiSecret],
                    'url' => ['secure' => true]
                ]);

                $upload = (new UploadApi())->upload($request->file('image')->getRealPath());
                $validated['image'] = $upload['secure_url'];
            } catch (\Exception $e) {
                return response()->json(['message' => 'Erreur Cloudinary: ' . $e->getMessage()], 500);
            }
        } else {
            $validated['image'] = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop';
        }

        $book = Book::create($validated);
        $book->load('categorie');

        return response()->json($book, 201);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:555',
            'resume' => 'nullable|string|max:1200',
            'nombre_pages' => 'nullable|integer',
            'langue' => 'sometimes|string|max:5',
            'stock' => 'sometimes|integer|min:0',
            'max_borrow_days' => 'sometimes|integer|min:1',
            'age_restriction' => 'nullable|integer|min:0',
            'categorie_id' => 'nullable|exists:categories,id',
        ]);

        if (isset($validated['titre'])) {
            $validated['slug'] = Str::slug($validated['titre']) ?: 'book-' . time();
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
        $book->update(['statut' => 'disponible']);
        return response()->json(['message' => 'Livre restauré', 'book' => $book]);
    }

    public function destroy(Book $book)
    {
        $book->delete();
        return response()->noContent();
    }
}
