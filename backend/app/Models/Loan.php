<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    /** @use HasFactory<\Database\Factories\LoanFactory> */
    use HasFactory;

    protected $fillable = [
        'book_id',
        'user_id',
        'date_pret',
        'date_retour_prevue',
        'date_retour_reelle',
    ];

    protected $casts = [
        'date_pret' => 'date',
        'date_retour_prevue' => 'date',
        'date_retour_reelle' => 'date',
    ];

    public function book()
    {
        // withTrashed: un prêt doit rester lisible même si le livre a été supprimé (soft delete)
        return $this->belongsTo(Book::class)->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeEnCours($q)
    {
        return $q->whereNull('date_retour_reelle');
    }

    public function scopeEnRetard($q)
    {
        return $q->whereNull('date_retour_reelle')->whereDate('date_retour_prevue', '<', today());
    }
}
