<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'customer_id',
        'invoice_number',
        'type',
        'amount',
        'month',
        'year',
        'status',
        'payment_method',
        'proof_path',
        'payment_date',
        'due_date',
        'invoice_date',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'due_date' => 'date',
        'invoice_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function getTypeLabelAttribute(): string
    {
        $map = [
            'bulanan' => 'Bulanan',
            'insidental' => 'Insidental',
        ];
        return $map[$this->attributes['type'] ?? 'bulanan'] ?? $this->attributes['type'] ?? 'bulanan';
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Auto-set status to Jatuh Tempo when due date has passed.
     */
    public function getStatusAttribute($value)
    {
        if (in_array($value, ['Unpaid']) && $this->due_date && now()->gt(\Carbon\Carbon::parse($this->due_date))) {
            return 'Jatuh Tempo';
        }
        return $value;
    }
}
