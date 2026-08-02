<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'customer_id',
        'amount',
        'month',
        'year',
        'status',
        'payment_method',
        'proof_path',
        'payment_date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
