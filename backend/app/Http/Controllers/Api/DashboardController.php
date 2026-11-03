<?php


namespace App\Http\Controllers\Api;

use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        // 🛡️ Validation dial l'data
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'sujet' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // 1. N-sjlo f Database (7ta ila l'email fchel, l'message kaybqa m7foud)
        $contact = ContactRequest::create($validated);

        // 2. N-sifto l'Email l'Admin
        try {
            $adminEmail = config('mail.admin_address', 'outergamoustafa@gmail.com');
            Mail::raw("Message de: {$validated['nom']} ({$validated['email']})\n\nSujet: {$validated['sujet']}\n\nMessage:\n{$validated['message']}", function ($message) use ($adminEmail, $validated) {
                $message->to($adminEmail)->subject('Nouveau message: ' . $validated['sujet']);
            });
        } catch (\Exception $e) {
            // Ila kan l'SMTP machi m9ad, l'operation kat-nj7 f l'Database
        }

        return response()->json(['message' => 'Votre message a été envoyé avec succès.'], 201);
    }
}