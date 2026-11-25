<?php

namespace App\Models\Concerns;

use App\Services\ImageUploader;

// Quand l'admin remplace ou supprime l'image d'un élément, l'ancienne est effacée de Cloudinary.
// Le modèle indique la colonne de son image avec champImageCloudinary().
// L'effacement se fait après l'envoi de la réponse (defer) : l'admin n'attend pas Cloudinary.
trait LibereImageCloudinary
{
    abstract protected function champImageCloudinary(): string;

    public static function bootLibereImageCloudinary(): void
    {
        static::updated(function ($modele) {
            $champ = $modele->champImageCloudinary();
            if ($modele->wasChanged($champ)) {
                static::libererImage($modele->getOriginal($champ));
            }
        });

        static::deleted(function ($modele) {
            // Suppression douce (Book) : le modèle remplace lui-même son image, ce qui passe par « updated »
            if (method_exists($modele, 'isForceDeleting') && ! $modele->isForceDeleting()) {
                return;
            }
            static::libererImage($modele->getOriginal($modele->champImageCloudinary()));
        });
    }

    protected static function libererImage(?string $url): void
    {
        if ($url) {
            defer(fn () => app(ImageUploader::class)->supprimerSiInutilisee($url));
        }
    }
}
