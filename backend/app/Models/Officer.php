<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Officer extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'nik',
        'phone',
        'address',
        'photo',
        'region',
        'schedule',
        'is_active',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'schedule' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pickupRequests()
    {
        return $this->hasMany(PickupRequest::class);
    }

    public function pickupHistories()
    {
        return $this->hasMany(PickupHistory::class);
    }
}
