<?php

namespace App\Http\Controllers\Api;

use App\Models\Sponsor;
use App\Services\ImageUploader;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SponsorController extends Controller
{
    public function index()
    {
        return response()->json(Sponsor::orderBy('ordre')->get());
    }

    public function store(Request $request)
    {
        $sponsor = Sponsor::create($this->validateSponsor($request));
        return response()->json($sponsor, 201);
    }

    public function update(Request $request, Sponsor $sponsor)
    {
        $sponsor->update($this->validateSponsor($request, true));
        return response()->json($sponsor);
    }

    public function destroy(Sponsor $sponsor)
    {
        $sponsor->delete();
        return response()->noContent();
    }

    // Le logo peut être une URL (logo) ou un fichier image envoyé (logo_file, multipart)
    private function validateSponsor(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        $validated = $request->validate([
            'nom' => "$required|string|max:255",
            'logo' => 'nullable|url|max:500',
            'logo_file' => 'nullable|image|max:2048',
            'lien_externe' => 'nullable|url|max:500',
            'ordre' => 'nullable|integer|min:0',
        ]);

        if ($request->hasFile('logo_file')) {
            $validated['logo'] = app(ImageUploader::class)->upload($request->file('logo_file'), 'sponsors');
        }
        unset($validated['logo_file']);

        return $validated;
    }
}
