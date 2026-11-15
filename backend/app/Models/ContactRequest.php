<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Message du formulaire de contact.
 * Il n'arrive à l'admin qu'après vérification de l'e-mail (code à 6 chiffres envoyé au visiteur).
 */
class ContactRequest extends Model
{
    /** @use HasFactory<\Database\Factories\ContactRequestFactory> */
    use HasFactory, Prunable;

    public const CODE_VALIDE_MINUTES = 15;
    public const ESSAIS_MAX = 5;

    protected $fillable = ['nom', 'email', 'sujet', 'message', 'lu', 'verified_at', 'locale'];

    protected $casts = [
        'lu' => 'boolean',
        'verified_at' => 'datetime',
        'verification_expires_at' => 'datetime',
    ];

    // Le code (même haché) et le jeton ne sortent jamais dans l'API
    protected $hidden = ['verification_token', 'verification_code_hash', 'verification_expires_at', 'verification_attempts'];

    // Messages jamais vérifiés (adresse fausse ou abandon) : supprimés après 24 h par « model:prune »
    public function prunable()
    {
        return static::whereNull('verified_at')->where('created_at', '<', now()->subDay());
    }

    public function scopeVerifies($query)
    {
        return $query->whereNotNull('verified_at');
    }

    public function estVerifie(): bool
    {
        return $this->verified_at !== null;
    }

    /** Génère un nouveau code (renvoyé en clair pour l'e-mail) ; seul son hash est stocké. */
    public function nouveauCode(): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->forceFill([
            'verification_token' => $this->verification_token ?: Str::random(48),
            'verification_code_hash' => Hash::make($code),
            'verification_expires_at' => now()->addMinutes(self::CODE_VALIDE_MINUTES),
            'verification_attempts' => 0,
        ])->save();

        return $code;
    }

    /**
     * Résultat : 'ok', 'expire', 'trop_essais' ou 'faux'.
     * Chaque essai faux est compté ; au-delà de 5 il faut demander un nouveau code.
     */
    public function verifierCode(string $code): string
    {
        if ($this->estVerifie()) {
            return 'ok';
        }
        if (!$this->verification_expires_at || $this->verification_expires_at->isPast()) {
            return 'expire';
        }
        if ($this->verification_attempts >= self::ESSAIS_MAX) {
            return 'trop_essais';
        }
        if (!Hash::check(trim($code), (string) $this->verification_code_hash)) {
            $this->increment('verification_attempts');
            return 'faux';
        }

        $this->forceFill([
            'verified_at' => now(),
            'verification_code_hash' => null,
            'verification_expires_at' => null,
        ])->save();

        return 'ok';
    }
}
