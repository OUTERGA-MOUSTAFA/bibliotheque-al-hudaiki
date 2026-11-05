<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'nom', 'nom_fr', 'nom_ar',
        'description', 'description_fr', 'description_ar',
        'slug', 'visuel', 'statut',
    ];

    protected static function booted(): void
    {
        // « nom » et « description » restent remplis (valeur de secours, colonne nom obligatoire)
        static::saving(function (Category $c) {
            $c->attributes['nom'] = $c->attributes['nom_fr'] ?? null ?: ($c->attributes['nom_ar'] ?? null ?: ($c->attributes['nom'] ?? ''));
            $c->attributes['description'] = $c->attributes['description_fr'] ?? null ?: ($c->attributes['description_ar'] ?? null ?: ($c->attributes['description'] ?? null));
        });
    }

    // Nom dans la langue de la requête (en-tête Accept-Language), avec repli sur l'autre langue
    protected function nom(): Attribute
    {
        return Attribute::get(fn($value, array $attrs) => self::localized($attrs, 'nom', $value));
    }

    protected function description(): Attribute
    {
        return Attribute::get(fn($value, array $attrs) => self::localized($attrs, 'description', $value));
    }

    private static function localized(array $attrs, string $field, ?string $fallback): ?string
    {
        $order = app()->getLocale() === 'ar' ? ['ar', 'fr'] : ['fr', 'ar'];
        foreach ($order as $lang) {
            if (!empty($attrs["{$field}_{$lang}"])) {
                return $attrs["{$field}_{$lang}"];
            }
        }
        return $fallback;
    }

    // Tri alphabétique sur le nom affiché dans la langue courante
    public function scopeOrderByLocalizedName($query)
    {
        $first = app()->getLocale() === 'ar' ? 'nom_ar' : 'nom_fr';
        $second = $first === 'nom_ar' ? 'nom_fr' : 'nom_ar';
        return $query->orderByRaw("COALESCE({$first}, {$second}, nom)");
    }

    public function books()
    {
        return $this->hasMany(Book::class, 'categorie_id');
    }
}
