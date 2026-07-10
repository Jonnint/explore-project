<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'track_code',
    'conversation_id',
    'product_id',
    'user_id',
    'agent_phone',
    'client_phone',
    'original_url',
    'clicked_at',
    'ip_address',
    'browser_agent',
    'profile_name',
])]
class LinkClick extends Model
{
    protected function casts(): array
    {
        return [
            'clicked_at' => 'datetime',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
