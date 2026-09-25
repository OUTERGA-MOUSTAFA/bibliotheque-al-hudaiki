<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;   // 👈 ZID HADI
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;   // 👈 ZID HasFactory

    protected $fillable = [
        'name',
        'nom',
        'prenom',
        'date_naissance',
        'adresse',
        'telephone',
        'cin',
        'numero_massar',
        'etablissement',
        'photo',
        'email',
        'password',
        'statut'
    ];

    protected $hidden = ['password', 'remember_token', 'cin', 'numero_massar'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_naissance' => 'date',
        'password' => 'hashed',
    ];

    // Auto-fill name men prenom + nom (Solution B)
    protected static function booted(): void
    {
        static::creating(function ($user) {
            if (empty($user->name)) {
                $user->name = trim(($user->prenom ?? '') . ' ' . ($user->nom ?? ''));
            }
        });
    }

    public function getAgeAttribute(): int
    {
        return $this->date_naissance?->age ?? 0;
    }

    public function getEstMajeurAttribute(): bool
    {
        return $this->age >= 18;
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
}
