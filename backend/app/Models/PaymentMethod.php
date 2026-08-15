<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'type',
        'bank_name',
        'account_number',
        'account_holder',
        'image_path',
        'description',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Only return active payment methods for public/customer use.
     */
    public function scopeActive($query)
    {
        $query->where('is_active', true)->orderBy('order', 'asc')->orderBy('name', 'asc');
    }
}
