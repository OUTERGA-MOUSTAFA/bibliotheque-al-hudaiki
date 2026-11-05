<?php

namespace App\Models;

use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasLocalePreference
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

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
        'statut',
        'consentement_at',
        'locale',
    ];

    protected $hidden = [
        'password', 'remember_token', 'cin', 'numero_massar',
        'two_factor_secret', 'two_factor_recovery_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'consentement_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
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

    // public function getAgeAttribute(): int
    // {
    //     return $this->date_naissance?->age ?? 0;
    // }
    public function getAgeAttribute(): int
    {
        return $this->date_naissance ? \Carbon\Carbon::parse($this->date_naissance)->age : 0;
    }

    public function getEstMajeurAttribute(): bool
    {
        return $this->age >= 18;
    }

    // Langue des e-mails et notifications envoyés à ce lecteur (Laravel l'utilise automatiquement)
    public function preferredLocale(): string
    {
        return in_array($this->locale, ['fr', 'ar'], true) ? $this->locale : 'fr';
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
