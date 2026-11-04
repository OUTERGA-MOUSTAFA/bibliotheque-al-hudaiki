<x-mail::message>
# Bonjour {{ $loan->user->prenom }},

Le livre **{{ $loan->book->titre }}** devait être rendu le
**{{ $loan->date_retour_prevue->format('d/m/Y') }}**
({{ (int) $loan->date_retour_prevue->diffInDays(today()) }} jour(s) de retard).

Merci de le rapporter à la bibliothèque dès que possible.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/') . '/compte/emprunts'">
Voir mes emprunts
</x-mail::button>

Merci,<br>
{{ config('app.name') }}
</x-mail::message>
