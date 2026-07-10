<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'code',
    'product_slug',
    'conversation_id',
    'agent_phone',
    'client_phone',
    'profile_name',
])]
class ShortLink extends Model
{
    //
}
