<?php

namespace App\Http\Controllers\Api;

use App\Mail\ContactRequestMail;
use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'sujet' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // 1. Enregistré en base : le message reste conservé même si l'e-mail échoue
        $contact = ContactRequest::create($validated);

        // 2. Notification de l'admin. Lire config() et non env() : env() renvoie null
        //    dès que la configuration est mise en cache (php artisan config:cache).
        $adminEmail = config('mail.admin_address');
        if ($adminEmail) {
            try {
                Mail::to($adminEmail)->send(new ContactRequestMail($contact));
            } catch (\Throwable $e) {
                Log::warning('Envoi du mail de contact échoué', ['error' => $e->getMessage()]);
            }
        }

        return response()->json(['message' => __('Votre message a été envoyé avec succès.')], 201);
    }

    // Admin : liste des messages reçus
    public function index(Request $request)
    {
        $query = ContactRequest::latest();

        if ($request->filtre === 'non_lus') {
            $query->where('lu', false);
        }

        return response()->json(array_merge(
            $query->paginate(20)->toArray(),
            ['non_lus' => ContactRequest::where('lu', false)->count()]
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
