<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickupHistory extends Model
{
    protected $fillable = [
        'pickup_request_id',
        'date',
        'officer_id',
        'weight',
        'cost',
        'status',
        'photo_before',
        'photo_after',
        'invoice_no',
    ];

    public function pickupRequest()
    {
        return $this->belongsTo(PickupRequest::class);
    }

    public function officer()
    {
        return $this->belongsTo(Officer::class);
    }
}
