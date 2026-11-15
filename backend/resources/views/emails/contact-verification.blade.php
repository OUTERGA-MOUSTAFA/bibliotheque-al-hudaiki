<x-mail::message>
# {{ __('Bonjour :prenom,', ['prenom' => $contact->nom]) }}

{{ __('Pour envoyer votre message à la bibliothèque, confirmez votre adresse e-mail avec ce code :') }}

<x-mail::panel>
<div style="font-size: 30px; font-weight: 700; letter-spacing: 8px; text-align: center; direction: ltr;">{{ $code }}</div>
</x-mail::panel>

{{ __('Ou cliquez simplement sur ce bouton :') }}

<x-mail::button :url="$lien">
{{ __('Confirmer mon adresse') }}
</x-mail::button>

{{ __('Ce code est valable :minutes minutes.', ['minutes' => $minutes]) }}
{{ __("Si vous n'avez rien envoyé, ignorez cet e-mail : aucun message ne sera transmis.") }}

{{ __('Bibliothèque Al Hudaiki') }}
</x-mail::message>
