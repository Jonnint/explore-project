<?php

use App\Models\PendingChat;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

test('authenticated agent can send manual whatsapp message using latest pending chat phone id', function () {
    config([
        'services.whatsapp.token' => 'test_whatsapp_token',
        'services.whatsapp.phone_id' => null,
        'services.whatsapp.api_version' => 'v25.0',
    ]);

    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'messaging_product' => 'whatsapp',
            'messages' => [
                ['id' => 'wamid.manual_message_123'],
            ],
        ], 200),
    ]);

    $user = User::factory()->create(['phone' => '628123456789']);

    $oldPendingChat = PendingChat::create([
        'message_id' => 'wamid.old',
        'from' => '628000000001',
        'body' => 'Old message',
        'agent_phone' => '628123456789',
        'phone_id' => 'old_phone_id',
        'status' => 'done',
    ]);
    $oldPendingChat->forceFill([
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ])->save();

    $latestPendingChat = PendingChat::create([
        'message_id' => 'wamid.latest',
        'from' => '628000000002',
        'body' => 'Latest message',
        'agent_phone' => '628123456789',
        'phone_id' => 'latest_phone_id',
        'status' => 'done',
    ]);
    $latestPendingChat->forceFill([
        'created_at' => now(),
        'updated_at' => now(),
    ])->save();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/whatsapp/send-message', [
        'to' => '628987654321',
        'body' => 'Hello!',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Message sent successfully.',
        ])
        ->assertJsonPath('data.messages.0.id', 'wamid.manual_message_123');

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), 'https://graph.facebook.com/v25.0/latest_phone_id/messages')
            && $request->hasHeader('Authorization')
            && $request->header('Authorization')[0] === 'Bearer test_whatsapp_token'
            && $request['messaging_product'] === 'whatsapp'
            && $request['recipient_type'] === 'individual'
            && $request['to'] === '628987654321'
            && $request['type'] === 'text'
            && $request['text']['body'] === 'Hello!';
    });
});

test('manual whatsapp message endpoint requires authentication', function () {
    $response = $this->postJson('/api/whatsapp/send-message', [
        'to' => '628987654321',
        'body' => 'Hello!',
    ]);

    $response->assertUnauthorized();
});

test('manual whatsapp message endpoint validates payload', function () {
    $user = User::factory()->create(['phone' => '628123456789']);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/whatsapp/send-message', [
        'to' => '',
        'body' => '',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['to', 'body']);
});

test('manual whatsapp message endpoint requires authenticated user phone', function () {
    $user = User::factory()->create(['phone' => null]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/whatsapp/send-message', [
        'to' => '628987654321',
        'body' => 'Hello!',
    ]);

    $response->assertUnprocessable()
        ->assertJson([
            'success' => false,
            'message' => 'Authenticated user does not have a phone number.',
        ]);
});

test('manual whatsapp message endpoint requires whatsapp token', function () {
    config(['services.whatsapp.token' => null]);

    $user = User::factory()->create(['phone' => '628123456789']);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/whatsapp/send-message', [
        'to' => '628987654321',
        'body' => 'Hello!',
    ]);

    $response->assertUnprocessable()
        ->assertJson([
            'success' => false,
            'message' => 'WhatsApp token is not configured.',
        ]);
});

test('manual whatsapp message endpoint requires phone id from pending chats', function () {
    config(['services.whatsapp.token' => 'test_whatsapp_token']);

    $user = User::factory()->create(['phone' => '628123456789']);

    PendingChat::create([
        'message_id' => 'wamid.other_agent',
        'from' => '628000000001',
        'body' => 'Other agent message',
        'agent_phone' => '628111111111',
        'phone_id' => 'other_phone_id',
        'status' => 'done',
    ]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/whatsapp/send-message', [
        'to' => '628987654321',
        'body' => 'Hello!',
    ]);

    $response->assertUnprocessable()
        ->assertJson([
            'success' => false,
            'message' => 'WhatsApp phone ID was not found for this agent.',
        ]);
});

test('manual whatsapp message endpoint returns graph api errors', function () {
    config([
        'services.whatsapp.token' => 'test_whatsapp_token',
        'services.whatsapp.api_version' => 'v25.0',
    ]);

    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'error' => [
                'message' => 'Invalid recipient.',
            ],
        ], 400),
    ]);

    $user = User::factory()->create(['phone' => '628123456789']);

    PendingChat::create([
        'message_id' => 'wamid.latest',
        'from' => '628000000002',
        'body' => 'Latest message',
        'agent_phone' => '628123456789',
        'phone_id' => 'latest_phone_id',
        'status' => 'done',
    ]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/whatsapp/send-message', [
        'to' => '628987654321',
        'body' => 'Hello!',
    ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'Invalid recipient.',
        ]);
});
