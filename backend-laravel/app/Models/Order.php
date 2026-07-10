<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'product_id',
    'quantity',
    'conversation_id',
    'agent_phone',
    'client_phone',
    'profile_name',
    'status',
    'total_price',
    'ordered_at',
])]
class Order extends Model
{
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    protected function casts(): array
    {
        return [
            'ordered_at' => 'datetime',
        ];
    }
}
