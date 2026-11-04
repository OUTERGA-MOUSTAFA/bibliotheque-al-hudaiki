<?php

namespace App\Mail;

use App\Models\ContactRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// Notification envoyée à l'admin quand un visiteur remplit le formulaire de contact
class ContactRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactRequest $contact)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouveau message : ' . $this->contact->sujet,
            // « Répondre » dans la boîte mail écrit directement au visiteur
            replyTo: [new Address($this->contact->email, $this->contact->nom)],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.contact-request');
    }
}
