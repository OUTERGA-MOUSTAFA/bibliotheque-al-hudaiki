<?php

namespace App\Services;

use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class ImageUploader
{
    // Envoie l'image sur Cloudinary et renvoie son URL https. Le détail d'une erreur reste dans les logs.
    public function upload(UploadedFile $file, string $folder): string
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

            $upload = (new UploadApi())->upload($file->getRealPath(), ['folder' => "al-hudaiki/{$folder}"]);

            return $upload['secure_url'];
        } catch (\Throwable $e) {
            Log::error('Upload Cloudinary échoué', ['folder' => $folder, 'error' => $e->getMessage()]);
            abort(502, __("L'envoi de l'image a échoué. Réessayez plus tard."));
        }
    }
}
