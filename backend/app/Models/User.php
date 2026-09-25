<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasRoles;

    protected $fillable = [
        'nom','prenom','date_naissance','adresse','telephone','cin',
        'numero_massar','etablissement','photo','email','password','statut'
    ];

    protected $hidden = ['password','remember_token','cin','numero_massar'];
    protected $casts  = ['date_naissance' => 'date','password' => 'hashed'];

    public function getAgeAttribute(): int {
        return $this->date_naissance?->age ?? 0;
    }
    public function getEstMajeurAttribute(): bool {
        return $this->age >= 18;
    }
    public function loans()   { return $this->hasMany(Loan::class); }
    public function reviews() { return $this->hasMany(Review::class); }
}