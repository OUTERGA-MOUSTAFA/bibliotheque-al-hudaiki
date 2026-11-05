<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Diapositive de la bannière d'accueil : une image et ses textes en français et en arabe
class HeroSlide extends Model
{
    use HasFactory;

    public const CHAMPS_TRADUITS = ['badge', 'titre', 'sous_titre', 'bouton'];

    protected $fillable = [
        'image',
        'badge_fr', 'badge_ar',
        'titre_fr', 'titre_ar',
        'sous_titre_fr', 'sous_titre_ar',
        'bouton_fr', 'bouton_ar',
        'lien', 'ordre', 'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'ordre' => 'integer',
    ];

    public function scopeVisibles($query)
    {
        return $query->where('actif', true)->orderBy('ordre')->orderBy('id');
    }

    // Version publique : textes dans la langue de la requête, avec repli sur l'autre langue
    public function enLangueCourante(): array
    {
        $ordre = app()->getLocale() === 'ar' ? ['ar', 'fr'] : ['fr', 'ar'];
        $textes = [];
        foreach (self::CHAMPS_TRADUITS as $champ) {
            $textes[$champ] = null;
            foreach ($ordre as $langue) {
                if (filled($this->{"{$champ}_{$langue}"})) {
                    $textes[$champ] = $this->{"{$champ}_{$langue}"};
                    break;
                }
            }
        }

        return ['id' => $this->id, 'image' => $this->image, 'lien' => $this->lien] + $textes;
    }
}
