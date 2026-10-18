<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 🛡️ Validation stricte (XSS / Injection)
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'date_naissance' => 'required|date|before:today',
            'adresse' => 'nullable|string|max:500',
            'telephone' => 'required|string|max:20',
            'cin' => 'nullable|string|unique:users,cin|max:20',
            'numero_massar' => 'nullable|string|unique:users,numero_massar|max:20',
            'etablissement' => 'nullable|string|max:255',
        ]);

        $age = Carbon::parse($validated['date_naissance'])->age;
        if ($age >= 18 && empty($validated['cin'])) {
            throw ValidationException::withMessages([
                'cin' => ['Le CIN est requis pour les personnes majeures.'],
            ]);
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['statut'] = 'actif';
        $validated['name'] = trim($validated['prenom'] . ' ' . $validated['nom']);

        $user = User::create($validated);
        $user->assignRole('lecteur');

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'nom', 'prenom', 'email', 'statut']),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            // Message 3am (machi "Email wrong" wla "Password wrong") bach may3rfouch l'hackers
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $user = Auth::user();
        if ($user->statut === 'archive') {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Votre compte a été archivé.'],
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user->only(['id', 'nom', 'prenom', 'email', 'statut']),
            'roles' => $user->getRoleNames(),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'roles' => $request->user()->getRoleNames(),
        ]);
    }
}