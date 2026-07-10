<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(
    'phone_number',
    'name',
    'product',
    'status',
    'last_message_at',
    'agent_phone',
    'messages',
)]
class Lead extends Model
{
    use HasFactory;

    protected $casts = [
        'last_message_at' => 'datetime',
        'messages' => 'array',
    ];

    public function conversations(): HasMany
    {
        return $this->hasMany(AgentConversation::class);
    }

    public function activeConversation(): ?AgentConversation
    {
        if ($this->last_message_at && $this->last_message_at->diffInMinutes(now()) <= 10) {
            return $this->conversations()->latest()->first();
        }

        return null;
    }
}
