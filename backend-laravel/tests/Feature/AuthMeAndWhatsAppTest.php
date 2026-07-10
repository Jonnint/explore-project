<?php

use App\Models\Lead;
use App\Models\PendingChat;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('api auth me returns user data and whatsapp connection details', function () {
    $user = User::factory()->create(['phone' => '6282125995606']);
    $this->actingAs($user);

    // Create a pending chat today
    PendingChat::create([
        'message_id' => 'msg_today_1',
        'from' => '0987654321',
        'body' => 'Hello',
        'agent_phone' => $user->phone,
        'client_phone' => '0987654321',
        'status' => 'done',
        'created_at' => now(),
    ]);

    // Create a lead with last_message_at yesterday
    Lead::factory()->create([
        'agent_phone' => $user->phone,
        'last_message_at' => now()->subDay(),
    ]);

    $response = $this->getJson('/api/auth/me');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'phone'],
            'whatsapp_connection' => [
                'status',
                'configured',
                'display_phone_number',
                'last_active',
                'last_active_human',
                'messages_today',
            ],
        ])
        ->assertJsonPath('whatsapp_connection.messages_today', 1)
        ->assertJsonPath('whatsapp_connection.display_phone_number', $user->phone);

    expect($response->json('whatsapp_connection.last_active'))->not->toBeNull();
});

test('api whatsapp test-connection success when credentials are valid', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Mock config to ensure they are not empty
    config([
        'services.whatsapp.token' => 'mock_token',
        'services.whatsapp.phone_id' => 'mock_phone_id',
    ]);

    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'id' => 'mock_phone_id',
            'display_phone_number' => '+62 856-1234-5678',
            'verified_name' => 'My Business AI',
            'quality_rating' => 'GREEN',
        ], 200),
    ]);

    $response = $this->postJson('/api/whatsapp/test-connection');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Connection successful.',
            'data' => [
                'id' => 'mock_phone_id',
                'display_phone_number' => '+62 856-1234-5678',
                'verified_name' => 'My Business AI',
                'quality_rating' => 'GREEN',
            ],
        ]);
});

test('api whatsapp test-connection failure when facebook API returns error', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Mock config to ensure they are not empty
    config([
        'services.whatsapp.token' => 'mock_token',
        'services.whatsapp.phone_id' => 'mock_phone_id',
    ]);

    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'error' => [
                'message' => 'Invalid OAuth access token.',
            ],
        ], 400),
    ]);

    $response = $this->postJson('/api/whatsapp/test-connection');

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'Facebook API Error: Invalid OAuth access token.',
        ]);
});

test('api whatsapp test-connection returns error when credentials are not configured', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Mock empty config
    config([
        'services.whatsapp.token' => '',
        'services.whatsapp.phone_id' => '',
    ]);

    $response = $this->postJson('/api/whatsapp/test-connection');

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'WhatsApp Token or Phone ID is not configured in .env file.',
        ]);
});
