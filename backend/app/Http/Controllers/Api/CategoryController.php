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
        // GET /admin/categories : toutes les catégories (protégé par role:admin)
        // GET /categories       : uniquement les catégories actives, avec le nombre de livres visibles
        $isAdmin = $request->is('api/admin/*');

        $query = Category::withCount(['books' => function ($q) use ($isAdmin) {
            if (!$isAdmin) $q->where('statut', '!=', 'archive');
        }])->orderBy('nom');

        if (!$isAdmin) {
            $query->where('statut', 'actif');
        }

        return response()->json($query->get());
    }

    private function slugUnique(string $nom, ?int $ignoreId = null): string
    {
        $base = Str::slug($nom) ?: 'categorie';
        $slug = $base;
        $i = 2;

        while (Category::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $validated['slug'] = $this->slugUnique($validated['nom']);
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

        if (isset($validated['nom']) && $validated['nom'] !== $category->nom) {
            $validated['slug'] = $this->slugUnique($validated['nom'], $category->id);
        }

        $category->update($validated);
        return response()->json($category);
    }

    public function archive(Category $category)
    {
        // Archivage (Safe delete)
        $category->update(['statut' => 'archive']);
        return response()->json(['message' => __('Catégorie archivée')]);
    }

    public function restore(Category $category)
    {
        $category->update(['statut' => 'actif']);
        return response()->json(['message' => __('Catégorie réactivée'), 'category' => $category]);
    }

    public function destroy(Category $category)
    {
        // Suppression définitive : les livres de cette catégorie passent « sans catégorie » (nullOnDelete)
        $category->delete();
        return response()->noContent();
    }
}
