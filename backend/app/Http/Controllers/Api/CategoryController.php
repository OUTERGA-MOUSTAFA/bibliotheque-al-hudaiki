<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        // Par défaut, on ne renvoie que les catégories actives pour le public
        // $query = Category::query();

        // if ($request->input('admin') !== 'true') {
        //     $query->where('statut', 'actif');
        // }

        // return response()->json($query->withCount('books')->get());

        try {
            // N-jbdo l'categories m3a 3adad l'ktub
            $query = Category::withCount('books');

            // Ila machi admin, n-affichiw ghir li actif
            if ($request->input('admin') !== 'true') {
                $query->where('statut', 'actif');
            }

            return response()->json($query->get());
        } catch (\Exception $e) {
            // Ila kan chi mochkil f l'Database, had l'JSON ghadi yban f l'Network tab
            return response()->json([
                'message' => 'Erreur DB: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $validated['slug'] = Str::slug($validated['nom']) ?: 'cat-' . time();
        $validated['statut'] = 'actif';

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        if (isset($validated['nom'])) {
            $validated['slug'] = Str::slug($validated['nom']) ?: 'cat-' . time();
        }

        $category->update($validated);
        return response()->json($category);
    }

    public function archive(Category $category)
    {
        // Archivage (Safe delete)
        $category->update(['statut' => 'archive']);
        return response()->json(['message' => 'Catégorie archivée']);
    }

    public function destroy(Category $category)
    {
        // Suppression définitive (à utiliser avec précaution)
        $category->delete();
        return response()->noContent();
    }
}
