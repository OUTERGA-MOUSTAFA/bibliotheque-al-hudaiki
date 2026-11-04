<?php

namespace App\Mail;

use App\Models\Loan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LateLoanMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Loan $loan)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rappel : livre à rendre — ' . $this->loan->book->titre,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.late-loan',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
