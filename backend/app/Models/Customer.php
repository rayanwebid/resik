<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'address',
        'province_id',
        'city_id',
        'district_id',
        'village_id',
        'postal_code',
        'latitude',
        'longitude',
        'house_photo',
        'customer_type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function pickupRequests()
    {
        return $this->hasMany(PickupRequest::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
