<?php

namespace App\Models;

use App\Models\Concerns\LibereImageCloudinary;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    use LibereImageCloudinary;

    protected function champImageCloudinary(): string
    {
        return 'logo';
    }

    protected $fillable = [
        'nom',
        'logo',
        'lien_externe',
        'ordre',
    ];
}