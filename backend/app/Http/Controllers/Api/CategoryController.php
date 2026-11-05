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
        }])->orderByLocalizedName();

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

    // Nom et description en français et en arabe ; au moins un des deux noms est obligatoire.
    // « nom » seul reste accepté (anciens appels) : il est alors rangé comme nom français.
    private function rules(bool $creation): array
    {
        $nom = $creation ? 'required_without_all:nom_ar,nom' : 'sometimes';
        return [
            'nom_fr' => "$nom|nullable|string|max:255",
            'nom_ar' => 'nullable|string|max:255',
            'nom' => 'nullable|string|max:255',
            'description_fr' => 'nullable|string|max:1000',
            'description_ar' => 'nullable|string|max:1000',
        ];
    }

    private function nomPourSlug(array $data): string
    {
        return $data['nom_fr'] ?? null ?: ($data['nom_ar'] ?? null ?: ($data['nom'] ?? ''));
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules(true));
        $validated['nom_fr'] ??= $validated['nom'] ?? null;
        unset($validated['nom']);

        $validated['slug'] = $this->slugUnique($this->nomPourSlug($validated));
        $validated['statut'] = 'actif';

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate($this->rules(false));
        if (array_key_exists('nom', $validated)) {
            $validated['nom_fr'] ??= $validated['nom'];
            unset($validated['nom']);
        }

        // Valeurs finales (un champ envoyé vide efface la traduction)
        $fr = array_key_exists('nom_fr', $validated) ? $validated['nom_fr'] : $category->nom_fr;
        $ar = array_key_exists('nom_ar', $validated) ? $validated['nom_ar'] : $category->nom_ar;
        if (!$fr && !$ar) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'nom_fr' => [__('Indiquez au moins un nom (français ou arabe).')],
            ]);
        }

        $nouveauNom = $this->nomPourSlug($validated);
        if ($nouveauNom !== '' && $nouveauNom !== ($category->nom_fr ?: $category->nom_ar)) {
            $validated['slug'] = $this->slugUnique($nouveauNom, $category->id);
        }

        $category->update($validated);
        return response()->json($category->fresh());
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
