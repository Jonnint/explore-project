<?php

namespace App\Models;

use Database\Factories\PendingChatFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'message_id',
    'from',
    'body',
    'agent_phone',
    'phone_id',
    'client_phone',
    'profile_name',
    'status',
    'response_message',
    'response_recommendations',
])]
class PendingChat extends Model
{
    /** @use HasFactory<PendingChatFactory> */
    use HasFactory;

    protected $casts = [
        'response_recommendations' => 'array',
    ];
}
