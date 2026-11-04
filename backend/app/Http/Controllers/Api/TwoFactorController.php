<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;

/**
 * Gestion de la double authentification (TOTP : Google Authenticator, Authy…) via l'API.
 * On réutilise les actions de Fortify, mais sans ses routes web (basées sur la session).
 *
 * Étapes : enable (QR code) → confirm (premier code) → actif. disable pour le retirer.
 */
class TwoFactorController extends Controller
{
    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'enabled' => $user->hasEnabledTwoFactorAuthentication(),
            'pending_confirmation' => !is_null($user->two_factor_secret) && is_null($user->two_factor_confirmed_at),
        ]);
    }

    public function enable(Request $request, EnableTwoFactorAuthentication $enable)
    {
        $request->validate(['password' => 'required|current_password:sanctum']);

        $user = $request->user();
        $enable($user, true);
        $user->refresh();

        return response()->json([
            'qr_code_svg' => $user->twoFactorQrCodeSvg(),
            // Clé à saisir à la main si le scan du QR code est impossible
            'secret' => decrypt($user->two_factor_secret),
        ]);
    }

    public function confirm(Request $request, ConfirmTwoFactorAuthentication $confirm)
    {
        $request->validate(['code' => 'required|string']);

        $user = $request->user();
        $confirm($user, $request->code); // lève une ValidationException si le code est faux

        return response()->json([
            'enabled' => true,
            'recovery_codes' => $user->fresh()->recoveryCodes(),
        ]);
    }

    public function recoveryCodes(Request $request, GenerateNewRecoveryCodes $generate)
    {
        $request->validate(['password' => 'required|current_password:sanctum']);

        $user = $request->user();
        abort_unless($user->hasEnabledTwoFactorAuthentication(), 422, __("La double authentification n'est pas active."));

        $generate($user);

        return response()->json(['recovery_codes' => $user->fresh()->recoveryCodes()]);
    }

    public function disable(Request $request, DisableTwoFactorAuthentication $disable)
    {
        $request->validate(['password' => 'required|current_password:sanctum']);

        $disable($request->user());

        return response()->json(['enabled' => false]);
    }
}
