<?php

namespace App\Http\Controllers\Api;

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
        ContactRequest::create($validated);

        // 2. Notification de l'admin (adresse configurée via ADMIN_EMAIL dans .env)
        $adminEmail = config('mail.admin_address');
        if ($adminEmail) {
            try {
                Mail::raw(
                    "Message de : {$validated['nom']} ({$validated['email']})\n\nSujet : {$validated['sujet']}\n\nMessage :\n{$validated['message']}",
                    function ($message) use ($adminEmail, $validated) {
                        $message->to($adminEmail)
                            ->replyTo($validated['email'], $validated['nom'])
                            ->subject('Nouveau message : ' . $validated['sujet']);
                    }
                );
            } catch (\Throwable $e) {
                Log::warning('Envoi du mail de contact échoué', ['error' => $e->getMessage()]);
            }
        }

        return response()->json(['message' => 'Votre message a été envoyé avec succès.'], 201);
    }

    // Admin : liste des messages reçus
    public function index()
    {
        return response()->json(ContactRequest::latest()->paginate(20));
    }

    public function markAsRead(ContactRequest $contactRequest)
    {
        $contactRequest->update(['lu' => true]);
        return response()->json($contactRequest);
    }
}
