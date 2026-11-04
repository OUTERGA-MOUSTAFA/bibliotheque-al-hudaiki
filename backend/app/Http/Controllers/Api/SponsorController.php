<?php

namespace App\Http\Controllers\Api;

use App\Models\Sponsor;
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

    private function validateSponsor(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'nom' => "$required|string|max:255",
            'logo' => 'nullable|url|max:500',
            'lien_externe' => 'nullable|url|max:500',
            'ordre' => 'nullable|integer|min:0',
        ]);
    }
}
