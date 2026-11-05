{{-- Rendu dans la langue du lecteur (User::preferredLocale) --}}
@php($locale = app()->getLocale() === 'ar' ? 'ar' : 'fr')
<x-mail::message>
# {{ __('Bonjour :prenom,', ['prenom' => $loan->user->prenom]) }}

{{ __('Le livre « :titre » devait être rendu le :date.', [
    'titre' => $loan->book->titre,
    'date' => $loan->date_retour_prevue->format('d/m/Y'),
]) }}

{{ __('Nombre de jours de retard : :count.', ['count' => max(1, (int) $loan->date_retour_prevue->diffInDays(today()))]) }}

{{ __('Merci de le rapporter à la bibliothèque dès que possible.') }}

<x-mail::button :url="rtrim(config('app.frontend_url'), '/') . '/' . $locale . '/compte/emprunts'">
{{ __('Voir mes emprunts') }}
</x-mail::button>

{{ __('Bibliothèque Al Hudaiki') }}
</x-mail::message>
