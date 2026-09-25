<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $data) {}

    public function build() {
        return $this->subject('📚 Nouvelle demande — Bibliothèque Al Hudaiki')
                    ->to(config('mail.admin_address'))
                    ->markdown('emails.contact-request');
    }
}