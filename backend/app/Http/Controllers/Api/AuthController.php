<?php

namespace App\Http\Controllers\Api;

use App\Models\ContactRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Illuminate\Validation\Rule;
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
            // Loi 09-08 : consentement explicite obligatoire
            'consentement' => 'accepted',
        ], [
            'consentement.accepted' => 'Vous devez accepter la politique de confidentialité (Loi 09-08).',
        ]);

        unset($validated['consentement']);
        $validated['consentement_at'] = now();

        $age = Carbon::parse($validated['date_naissance'])->age;
        if ($age >= 18 && empty($validated['cin'])) {
            throw ValidationException::withMessages([
                'cin' => ['Le CIN est requis pour les personnes majeures.'],
            ]);
        }

        $validated['email'] = strtolower($validated['email']);
        $validated['password'] = Hash::make($validated['password']);
        $validated['statut'] = 'actif';
        $validated['name'] = trim($validated['prenom'] . ' ' . $validated['nom']);

        $user = User::create($validated);
        $user->assignRole('lecteur');

        return response()->json($this->sessionPayload($user), 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::whereRaw('LOWER(email) = ?', [strtolower($credentials['email'])])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            // Message général : on ne dit pas si c'est l'e-mail ou le mot de passe qui est faux
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if ($user->statut === 'archive') {
            throw ValidationException::withMessages([
                'email' => ['Votre compte a été archivé.'],
            ]);
        }

        // 🔐 2FA active : pas de token tout de suite, on demande d'abord le code de l'application
        if ($user->hasEnabledTwoFactorAuthentication()) {
            $challenge = Str::random(64);
            Cache::put("2fa-challenge:{$challenge}", $user->id, now()->addMinutes(5));

            return response()->json([
                'two_factor' => true,
                'challenge' => $challenge,
            ]);
        }

        return response()->json($this->sessionPayload($user));
    }

    // Deuxième étape de connexion : code TOTP à 6 chiffres, ou un code de secours
    public function twoFactorChallenge(Request $request, TwoFactorAuthenticationProvider $provider)
    {
        $validated = $request->validate([
            'challenge' => 'required|string',
            'code' => 'nullable|string|required_without:recovery_code',
            'recovery_code' => 'nullable|string',
        ]);

        $cacheKey = "2fa-challenge:{$validated['challenge']}";
        $user = User::find(Cache::get($cacheKey));

        if (!$user || !$user->hasEnabledTwoFactorAuthentication()) {
            throw ValidationException::withMessages([
                'code' => ['Session expirée. Reconnectez-vous.'],
            ]);
        }

        $valide = false;

        if (!empty($validated['code'])) {
            $valide = $provider->verify(decrypt($user->two_factor_secret), $validated['code']);
        } elseif (!empty($validated['recovery_code'])) {
            $code = collect($user->recoveryCodes())->first(
                fn($c) => hash_equals($c, trim($validated['recovery_code']))
            );
            if ($code) {
                $user->replaceRecoveryCode($code); // un code de secours ne sert qu'une fois
                $valide = true;
            }
        }

        if (!$valide) {
            throw ValidationException::withMessages([
                'code' => ['Code invalide.'],
            ]);
        }

        Cache::forget($cacheKey);

        return response()->json($this->sessionPayload($user));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'two_factor_enabled' => $user->hasEnabledTwoFactorAuthentication(),
        ]);
    }

    // Loi 09-08 — droit d'accès : toutes les données détenues sur le lecteur, en JSON
    public function exportData(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'genere_le' => now()->toIso8601String(),
            'profil' => $user->makeVisible(['cin', 'numero_massar'])->only([
                'nom', 'prenom', 'email', 'date_naissance', 'adresse', 'telephone',
                'cin', 'numero_massar', 'etablissement', 'statut', 'created_at', 'consentement_at',
            ]),
            'emprunts' => $user->loans()->with('book:id,titre')->get()
                ->map(fn($l) => [
                    'livre' => $l->book?->titre,
                    'date_pret' => $l->date_pret?->toDateString(),
                    'date_retour_prevue' => $l->date_retour_prevue?->toDateString(),
                    'date_retour_reelle' => $l->date_retour_reelle?->toDateString(),
                ]),
            'favoris' => $user->favorites()->with('book:id,titre')->get()->pluck('book.titre')->filter()->values(),
            'avis' => $user->reviews()->with('book:id,titre')->get()
                ->map(fn($r) => ['livre' => $r->book?->titre, 'note' => $r->note, 'commentaire' => $r->commentaire]),
            'messages_contact' => ContactRequest::where('email', $user->email)->get(['sujet', 'message', 'created_at']),
        ]);
    }

    // Loi 09-08 — droit à l'effacement : suppression définitive du compte
    public function deleteAccount(Request $request)
    {
        $request->validate(['password' => 'required|current_password:sanctum']);

        $user = $request->user();

        if ($user->hasRole('admin')) {
            abort(422, "Un compte administrateur ne peut pas être supprimé depuis cet écran.");
        }

        if ($user->loans()->enCours()->exists()) {
            abort(422, "Rendez d'abord vos livres en cours avant de supprimer votre compte.");
        }

        $user->tokens()->delete();
        ContactRequest::where('email', $user->email)->delete();
        $user->delete(); // emprunts, favoris et avis supprimés en cascade

        return response()->noContent();
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'adresse' => 'nullable|string|max:500',
            'telephone' => 'sometimes|required|string|max:20',
            'etablissement' => 'nullable|string|max:255',
            // Changement de mot de passe : l'ancien est obligatoire
            'current_password' => 'required_with:password|current_password:sanctum',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        unset($validated['current_password']);
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->fill($validated);
        if ($user->isDirty(['nom', 'prenom'])) {
            $user->name = trim($user->prenom . ' ' . $user->nom);
        }
        $user->save();

        return response()->json([
            'user' => $user->fresh(),
            'roles' => $user->getRoleNames(),
        ]);
    }

    // Réponse commune après inscription / connexion réussie
    private function sessionPayload(User $user): array
    {
        return [
            'user' => $user->only(['id', 'nom', 'prenom', 'email', 'statut', 'date_naissance', 'telephone', 'adresse', 'etablissement', 'photo']),
            'roles' => $user->getRoleNames(),
            'token' => $user->createToken('auth')->plainTextToken,
        ];
    }
}