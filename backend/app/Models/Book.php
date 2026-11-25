<?php

namespace App\Models;

use App\Models\Concerns\LibereImageCloudinary;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    /** @use HasFactory<\Database\Factories\BookFactory> */
    use HasFactory, SoftDeletes, LibereImageCloudinary;

    // Couverture affichée quand l'admin n'a pas envoyé d'image
    public const IMAGE_PAR_DEFAUT = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop';

    protected function champImageCloudinary(): string
    {
        return 'image';
    }

    protected static function booted(): void
    {
        // Livre supprimé (suppression douce, il reste lisible dans l'historique des prêts) :
        // il reprend la couverture par défaut, et ce changement d'image efface l'ancienne de Cloudinary
        static::deleted(function (Book $book) {
            if (! $book->isForceDeleting() && $book->image !== self::IMAGE_PAR_DEFAUT) {
                $book->image = self::IMAGE_PAR_DEFAUT;
                $book->save();
            }
        });
    }

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
        'nb_emprunts',
        'max_borrow_days',
        'age_restriction',
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
