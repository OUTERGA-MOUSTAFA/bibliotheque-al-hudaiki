<x-mail::message>
# Nouveau message de contact

**De :** {{ $contact->nom }} ({{ $contact->email }})<br>
**Sujet :** {{ $contact->sujet }}

<x-mail::panel>
{{ $contact->message }}
</x-mail::panel>

Répondez simplement à cet e-mail pour écrire à {{ $contact->nom }}.

<x-mail::button :url="rtrim(config('app.frontend_url'), '/') . '/admin/contacts'">
Voir tous les messages
</x-mail::button>

{{ config('app.name') }}
</x-mail::message>
