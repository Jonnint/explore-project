<?php

use App\Models\AgentConversation;
use App\Models\Lead;
use App\Models\User;

test('api leads returns leads with last_message', function () {
    $user = User::factory()->create(['phone' => '1234567890']);
    $this->actingAs($user);

    $lead = Lead::factory()->create([
        'agent_phone' => '1234567890',
        'last_message_at' => now(),
    ]);

    $conversation = AgentConversation::forceCreate([
        'id' => 'conv_123',
        'lead_id' => $lead->id,
        'title' => 'Test Conversation',
    ]);

    $lead->messages = [
        [
            'from' => $lead->phone_number,
            'body' => 'Hello from client!',
            'conversation_id' => $conversation->id,
            'wa_message_id' => 'wa_msg_123',
            'sent_at' => now()->toIso8601String(),
        ],
    ];
    $lead->save();

    $response = $this->getJson('/api/leads');

    $response->assertStatus(200)
        ->assertJsonPath('leads.0.last_message', 'Hello from client!');
});

test('api lead show returns lead details with insights structure', function () {
    $user = User::factory()->create(['phone' => '1234567890']);
    $this->actingAs($user);

    $lead = Lead::factory()->create([
        'agent_phone' => '1234567890',
        'last_message_at' => now(),
    ]);

    $conversation = AgentConversation::forceCreate([
        'id' => 'conv_123',
        'lead_id' => $lead->id,
        'title' => 'Test Conversation',
    ]);

    $lead->messages = [
        [
            'from' => $lead->phone_number,
            'body' => 'Hello from client!',
            'conversation_id' => $conversation->id,
            'wa_message_id' => 'wa_msg_123',
            'sent_at' => now()->toIso8601String(),
        ],
    ];
    $lead->save();

    $response = $this->getJson("/api/leads/{$lead->id}");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'lead' => [
                'id',
                'name',
                'phone_number',
                'product',
                'status',
                'last_message_at',
                'conversations',
                'insights' => [
                    'summary',
                    'purchase_readiness',
                    'sentiment',
                    'suggested_action',
                ],
            ],
        ]);
});
