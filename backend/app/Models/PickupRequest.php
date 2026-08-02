<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickupRequest extends Model
{
    protected $fillable = [
        'customer_id',
        'officer_id',
        'date',
        'time',
        'waste_type',
        'estimated_weight',
        'notes',
        'photo',
        'latitude',
        'longitude',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function officer()
    {
        return $this->belongsTo(Officer::class);
    }

    public function histories()
    {
        return $this->hasMany(PickupHistory::class);
    }
}
