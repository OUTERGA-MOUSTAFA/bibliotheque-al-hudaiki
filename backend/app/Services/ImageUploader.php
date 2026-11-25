<?php

namespace App\Services;

use App\Models\Book;
use App\Models\HeroSlide;
use App\Models\Sponsor;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class ImageUploader
{
    // Dossier Cloudinary du site : on ne supprime jamais rien en dehors
    private const DOSSIER = 'al-hudaiki';

    // Envoie l'image sur Cloudinary et renvoie son URL https. Le détail d'une erreur reste dans les logs.
    public function upload(UploadedFile $file, string $folder): string
    {
        try {
            $this->configurer();
            $upload = (new UploadApi())->upload($file->getRealPath(), ['folder' => self::DOSSIER . "/{$folder}"]);

            return $upload['secure_url'];
        } catch (\Throwable $e) {
            Log::error('Upload Cloudinary échoué', ['folder' => $folder, 'error' => $e->getMessage()]);
            abort(502, __("L'envoi de l'image a échoué. Réessayez plus tard."));
        }
    }

    // Efface de Cloudinary une image qui n'est plus utilisée nulle part sur le site.
    // Ne fait rien pour une image externe (Unsplash, logo collé par URL…) ou encore utilisée ailleurs.
    // Un échec n'empêche jamais l'action de l'admin : il est seulement noté dans les logs.
    public function supprimerSiInutilisee(?string $url): void
    {
        $publicId = $this->publicId($url);
        if ($publicId === null || $this->encoreUtilisee($url)) {
            return;
        }

        try {
            $this->detruire($publicId);
        } catch (\Throwable $e) {
            Log::warning('Suppression Cloudinary échouée', ['public_id' => $publicId, 'error' => $e->getMessage()]);
        }
    }

    // « https://res.cloudinary.com/<compte>/image/upload/v123/al-hudaiki/books/abc.jpg » → « al-hudaiki/books/abc »
    public function publicId(?string $url): ?string
    {
        $compte = config('services.cloudinary.cloud_name');
        if (! $url || ! $compte) {
            return null;
        }

        $motif = '#^https?://res\.cloudinary\.com/' . preg_quote($compte, '#')
            . '/image/upload/(?:[^/]+/)*?(' . self::DOSSIER . '/[^?\#]+?)(?:\.[a-z0-9]+)?(?:[?\#].*)?$#i';

        return preg_match($motif, $url, $m) ? $m[1] : null;
    }

    protected function detruire(string $publicId): void
    {
        $this->configurer();
        $resultat = (new UploadApi())->destroy($publicId, ['invalidate' => true]);

        // « not found » : déjà supprimée, rien à signaler
        if (! in_array($resultat['result'] ?? null, ['ok', 'not found'], true)) {
            Log::warning('Suppression Cloudinary refusée', ['public_id' => $publicId, 'result' => $resultat['result'] ?? null]);
        }
    }

    private function encoreUtilisee(string $url): bool
    {
        return Book::withTrashed()->where('image', $url)->exists()
            || HeroSlide::where('image', $url)->exists()
            || Sponsor::where('logo', $url)->exists();
    }

    private function configurer(): void
    {
        Configuration::instance([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
            'url' => ['secure' => true],
        ]);
    }
}
