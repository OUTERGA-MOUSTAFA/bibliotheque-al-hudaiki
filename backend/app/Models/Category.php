<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    protected $fillable = ['nom', 'slug', 'visuel', 'description', 'statut'];

    public function books()
    {
        // return $this->hasMany(Book::class);
        return $this->hasMany(Book::class, 'categorie_id');
    }
}
