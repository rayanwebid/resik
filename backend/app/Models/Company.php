<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies'; // Explicitly override plural mapping if needed
    protected $fillable = [
        'name',
        'history',
        'vision',
        'mission',
        'address',
        'phone',
        'email',
        'logo',
    ];
}
