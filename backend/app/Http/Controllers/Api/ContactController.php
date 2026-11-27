<?php

namespace App\Http\Controllers\Api;

use App\Mail\ContactRequestMail;
use App\Mail\ContactVerificationMail;
use App\Console\Commands\SendTestMail;
use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

/**
 * Formulaire de contact avec vérification de l'adresse e-mail :
 *  1. POST /contact          → message enregistré « en attente », code à 6 chiffres envoyé au visiteur
 *  2. POST /contact/verify   → code correct : message validé et transmis à l'admin
 *  3. POST /contact/resend   → nouveau code (au plus un par minute)
 * Une adresse inventée ne reçoit jamais le code : le message n'atteint jamais l'admin
 * et il est supprimé au bout de 24 h (model:prune).
 */
class ContactController extends Controller
{
    private const DELAI_RENVOI_SECONDES = 60;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            // dns : refuse tout de suite un domaine qui ne peut pas recevoir d'e-mail (ex. @gmial.cm)
            'email' => ['required', 'max:255', config('mail.verify_dns', true) ? 'email:rfc,dns' : 'email:rfc'],
            'sujet' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $contact = ContactRequest::create($validated + ['locale' => app()->getLocale()]);

        if (!$this->envoyerCode($contact)) {
            // Sans e-mail envoyé, le visiteur ne pourrait jamais valider : on ne garde pas le message
            $contact->delete();
            abort(503, __("L'e-mail de vérification n'a pas pu être envoyé. Réessayez dans quelques minutes."));
        }

        return response()->json([
            'message' => __('Un code de vérification a été envoyé à votre adresse e-mail.'),
            'token' => $contact->verification_token,
            'email' => $contact->email,
            'expires_in' => ContactRequest::CODE_VALIDE_MINUTES * 60,
        ], 201);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string|max:64',
            'code' => 'required|digits:6',
        ]);

        $contact = ContactRequest::where('verification_token', $validated['token'])->first();
        if (!$contact) {
            throw ValidationException::withMessages(['code' => [__('Ce lien de vérification est invalide.')]]);
        }

        $dejaVerifie = $contact->estVerifie();
        $resultat = $contact->verifierCode($validated['code']);

        if ($resultat !== 'ok') {
            $restants = max(0, ContactRequest::ESSAIS_MAX - $contact->verification_attempts);
            $message = match ($resultat) {
                'expire' => __('Ce code a expiré. Demandez-en un nouveau.'),
                'trop_essais' => __('Trop de codes incorrects. Demandez un nouveau code.'),
                default => trans_choice('Code incorrect. Il vous reste :count essai.|Code incorrect. Il vous reste :count essais.', $restants, ['count' => $restants]),
            };
            throw ValidationException::withMessages(['code' => [$message]]);
        }

        // Transmis à l'admin une seule fois, au moment de la validation
        if (!$dejaVerifie) {
            $this->notifierAdmin($contact);
        }

        return response()->json(['message' => __('Votre message a été envoyé avec succès.')]);
    }

    public function resend(Request $request)
    {
        $validated = $request->validate(['token' => 'required|string|max:64']);

        $contact = ContactRequest::where('verification_token', $validated['token'])->first();
        if (!$contact) {
            throw ValidationException::withMessages(['token' => [__('Ce lien de vérification est invalide.')]]);
        }
        if ($contact->estVerifie()) {
            return response()->json(['message' => __('Votre message a été envoyé avec succès.'), 'verified' => true]);
        }

        // Au plus un nouveau code par minute pour un même message
        $envoyeA = $contact->verification_expires_at?->copy()->subMinutes(ContactRequest::CODE_VALIDE_MINUTES);
        if ($envoyeA && $envoyeA->diffInSeconds(now()) < self::DELAI_RENVOI_SECONDES) {
            abort(429, __('Patientez une minute avant de demander un nouveau code.'));
        }

        if (!$this->envoyerCode($contact)) {
            abort(503, __("L'e-mail de vérification n'a pas pu être envoyé. Réessayez dans quelques minutes."));
        }

        return response()->json(['message' => __('Un nouveau code vous a été envoyé.')]);
    }

    private function envoyerCode(ContactRequest $contact): bool
    {
        try {
            Mail::to($contact->email)->send(new ContactVerificationMail($contact, $contact->nouveauCode()));
            return true;
        } catch (\Throwable $e) {
            Log::error('Envoi du code de vérification échoué', [
                'contact' => $contact->id,
                'error' => $e->getMessage(),
                // Que faire, pour les refus Brevo les plus fréquents (visible dans Railway → Deploy Logs)
                'conseil' => SendTestMail::conseil($e->getMessage()),
            ]);
            return false;
        }
    }

    private function notifierAdmin(ContactRequest $contact): void
    {
        // Lire config() et non env() : env() renvoie null quand la configuration est en cache
        $adminEmail = config('mail.admin_address');
        if (!$adminEmail) {
            return;
        }
        try {
            Mail::to($adminEmail)->send(new ContactRequestMail($contact));
        } catch (\Throwable $e) {
            Log::warning('Envoi du mail de contact à l\'admin échoué', ['error' => $e->getMessage()]);
        }
    }

    // Admin : uniquement les messages dont l'adresse a été vérifiée
    public function index(Request $request)
    {
        $query = ContactRequest::verifies()->latest();

        if ($request->filtre === 'non_lus') {
            $query->where('lu', false);
        }

        return response()->json(array_merge(
            $query->paginate(20)->toArray(),
            ['non_lus' => ContactRequest::verifies()->where('lu', false)->count()]
        ));
    }

    public function markAsRead(Request $request, ContactRequest $contactRequest)
    {
        $contactRequest->update(['lu' => $request->boolean('lu', true)]);
        return response()->json($contactRequest);
    }

    public function destroy(ContactRequest $contactRequest)
    {
        $contactRequest->delete();
        return response()->noContent();
    }
}
