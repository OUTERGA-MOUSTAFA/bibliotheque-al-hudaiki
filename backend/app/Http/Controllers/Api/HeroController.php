<?php

namespace App\Http\Controllers\Api;

use App\Models\HeroSlide;
use App\Models\SiteSetting;
use App\Services\ImageUploader;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;

// Bannière de la page d'accueil (« hero ») : modèle d'affichage + diapositives bilingues
class HeroController extends Controller
{
    private const MODELES = ['classique', 'carrousel', 'image'];

    // Public : réglages + diapositives actives, textes dans la langue demandée
    public function show()
    {
        return response()->json([
            'reglages' => SiteSetting::hero(),
            'slides' => HeroSlide::visibles()->get()->map->enLangueCourante()->values(),
        ]);
    }

    // ───────────── Admin ─────────────

    public function adminIndex()
    {
        return response()->json([
            'reglages' => SiteSetting::hero(),
            'slides' => HeroSlide::orderBy('ordre')->orderBy('id')->get(),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'modele' => ['sometimes', Rule::in(self::MODELES)],
            'defilement' => 'sometimes|integer|min:3|max:30',
            'afficher_stats' => 'sometimes|boolean',
        ]);

        return response()->json(SiteSetting::enregistrerHero($validated));
    }

    public function store(Request $request)
    {
        $data = $this->valider($request);
        $data['ordre'] ??= (HeroSlide::max('ordre') ?? -1) + 1;

        return response()->json(HeroSlide::create($data), 201);
    }

    // PUT JSON, ou POST multipart avec _method=PUT pour remplacer l'image
    public function update(Request $request, HeroSlide $heroSlide)
    {
        $heroSlide->update($this->valider($request, $heroSlide));
        return response()->json($heroSlide->fresh());
    }

    public function destroy(HeroSlide $heroSlide)
    {
        $heroSlide->delete();
        return response()->noContent();
    }

    // Nouvel ordre des diapositives : liste d'identifiants
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:hero_slides,id',
        ]);

        foreach ($validated['ids'] as $position => $id) {
            HeroSlide::whereKey($id)->update(['ordre' => $position]);
        }

        return response()->json(HeroSlide::orderBy('ordre')->get());
    }

    private function valider(Request $request, ?HeroSlide $slide = null): array
    {
        $creation = $slide === null;
        $texte = 'nullable|string|max:255';
        $validated = $request->validate([
            // Image : fichier envoyé (Cloudinary) ou adresse https déjà en ligne
            'image_file' => [$creation ? 'required_without:image' : 'nullable', 'image', 'max:5120'],
            'image' => $creation ? ['required_without:image_file', 'nullable', 'url', 'max:500'] : ['sometimes', 'url', 'max:500'],
            'badge_fr' => $texte, 'badge_ar' => $texte,
            'titre_fr' => $texte, 'titre_ar' => $texte,
            'sous_titre_fr' => 'nullable|string|max:600', 'sous_titre_ar' => 'nullable|string|max:600',
            'bouton_fr' => 'nullable|string|max:60', 'bouton_ar' => 'nullable|string|max:60',
            // Lien interne (/catalogue…) ou externe (https://…)
            'lien' => ['nullable', 'string', 'max:500', 'regex:#^(/|https?://)#'],
            'ordre' => 'nullable|integer|min:0',
            'actif' => 'sometimes|boolean',
        ], [
            'lien.regex' => __('Le lien doit commencer par / (page du site) ou par https://.'),
        ]);

        // Un bouton sans lien ne mènerait nulle part (valeurs envoyées, sinon celles déjà enregistrées)
        $valeur = fn(string $champ) => array_key_exists($champ, $validated) ? $validated[$champ] : $slide?->{$champ};
        if ((filled($valeur('bouton_fr')) || filled($valeur('bouton_ar'))) && blank($valeur('lien'))) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'lien' => [__('Indiquez le lien du bouton.')],
            ]);
        }

        // Envoi sur Cloudinary seulement une fois tout le reste validé
        if ($request->hasFile('image_file')) {
            $validated['image'] = app(ImageUploader::class)->upload($request->file('image_file'), 'hero');
        }
        unset($validated['image_file']);

        return $validated;
    }
}
