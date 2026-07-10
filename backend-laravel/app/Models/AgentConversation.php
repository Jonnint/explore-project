<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentConversation extends Model
{
    protected $table = 'agent_conversations';

    protected $fillable = ['id', 'lead_id'];

    protected $keyType = 'string';

    public $incrementing = false;

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
