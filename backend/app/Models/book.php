<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Book extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'titre',
        'slug',
        'description',
        'resume',
        'nombre_pages',
        'langue',
        'stock',
        'categorie_id',
        'statut',
        'themes',
        'personnes',
        'lieux',
        'periodes',
        'image',
        'note_moyenne',
        'nb_favoris',
        'nb_emprunts'
    ];

    protected $casts = [
        'themes' => 'array',
        'personnes' => 'array',
        'lieux' => 'array',
        'periodes' => 'array',
        'note_moyenne' => 'float', // 👈 ZID HAD L'ASTOR
        'nb_favoris' => 'integer', // 👈 ZID HAD L'ASTOR
        'nb_emprunts' => 'integer', // 👈 ZID HAD L'ASTOR
    ];

    public function categorie()
    {
        return $this->belongsTo(Category::class, 'categorie_id'); // 👈 Nfs l'7aja hna
    }
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function scopeDisponible($q)
    {
        return $q->where('stock', '>', 0)->where('statut', 'disponible');
    }
    public function scopePopulaire($q)
    {
        return $q->orderByDesc('nb_emprunts');
    }
}
