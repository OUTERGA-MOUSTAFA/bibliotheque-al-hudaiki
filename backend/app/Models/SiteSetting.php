<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

// Réglages du site modifiables par l'admin (clé → valeur JSON), mis en cache
class SiteSetting extends Model
{
    protected $primaryKey = 'cle';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['cle', 'valeur'];
    protected $casts = ['valeur' => 'array'];

    // Valeurs par défaut du hero : le modèle « classique » reproduit la bannière d'origine
    public const HERO_DEFAUTS = [
        'modele' => 'classique',   // classique | carrousel | image
        'defilement' => 6,         // secondes entre deux diapositives
        'afficher_stats' => true,  // compteurs sous le titre (modèle classique)
    ];

    public static function hero(): array
    {
        $valeur = Cache::rememberForever('site_settings.hero', fn() => static::find('hero')?->valeur ?? []);
        return array_merge(self::HERO_DEFAUTS, $valeur);
    }

    public static function enregistrerHero(array $valeur): array
    {
        static::updateOrCreate(['cle' => 'hero'], ['valeur' => array_merge(self::hero(), $valeur)]);
        Cache::forget('site_settings.hero');
        return self::hero();
    }
}
