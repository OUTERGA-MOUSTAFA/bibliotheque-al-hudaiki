<?php

namespace App\Mail;

use App\Models\ContactRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// Code de vérification envoyé au visiteur qui a rempli le formulaire de contact (dans sa langue)
class ContactVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactRequest $contact, public string $code)
    {
        $this->locale($contact->locale ?: 'fr');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: __('Votre code de vérification : :code', ['code' => $this->code]));
    }

    public function content(): Content
    {
        $locale = $this->contact->locale === 'ar' ? 'ar' : 'fr';

        return new Content(markdown: 'emails.contact-verification', with: [
            'lien' => rtrim(config('app.frontend_url'), '/') . "/{$locale}/contact/verifier?" . http_build_query([
                'token' => $this->contact->verification_token,
                'code' => $this->code,
            ]),
            'minutes' => ContactRequest::CODE_VALIDE_MINUTES,
        ]);
    }
}
