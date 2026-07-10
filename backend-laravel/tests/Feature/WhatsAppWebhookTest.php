<?php

use App\Jobs\ProcessPendingChatsJob;
use App\Models\AgentConversation;
use App\Models\PendingChat;
use App\Services\SalesAssistService;
use App\Services\WhatsAppServices;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

test('whatsapp webhook verification succeeds with correct verify token', function () {
    config(['services.whatsapp.verify_token' => 'my_secret_verify_token']);

    $response = $this->get('/api/webhook/whatsapp?'.http_build_query([
        'hub_mode' => 'subscribe',
        'hub_verify_token' => 'my_secret_verify_token',
        'hub_challenge' => 'challenge_code_123',
    ]));

    $response->assertStatus(200)
        ->assertSee('challenge_code_123');
});

test('whatsapp webhook verification fails with incorrect verify token', function () {
    config(['services.whatsapp.verify_token' => 'my_secret_verify_token']);

    $response = $this->get('/api/webhook/whatsapp?'.http_build_query([
        'hub_mode' => 'subscribe',
        'hub_verify_token' => 'wrong_token',
        'hub_challenge' => 'challenge_code_123',
    ]));

    $response->assertStatus(403)
        ->assertSee('Forbidden');
});

test('whatsapp webhook receive successfully extracts and stores dynamic phone_id and triggers typing indicator', function () {
    Queue::fake();

    Http::fake([
        'https://graph.facebook.com/*' => Http::response(['success' => true], 200),
    ]);

    $payload = [
        'object' => 'whatsapp_business_account',
        'entry' => [
            [
                'id' => '123456789',
                'changes' => [
                    [
                        'value' => [
                            'messaging_product' => 'whatsapp',
                            'metadata' => [
                                'display_phone_number' => '628123456789',
                                'phone_number_id' => 'custom_phone_id_987',
                            ],
                            'contacts' => [
                                [
                                    'profile' => [
                                        'name' => 'John Doe',
                                    ],
                                    'wa_id' => '628987654321',
                                ],
                            ],
                            'messages' => [
                                [
                                    'from' => '628987654321',
                                    'id' => 'wamid.test_msg_id_123',
                                    'timestamp' => '1622550000',
                                    'text' => [
                                        'body' => 'Halo, saya tertarik',
                                    ],
                                    'type' => 'text',
                                ],
                            ],
                        ],
                        'field' => 'messages',
                    ],
                ],
            ],
        ],
    ];

    config([
        'services.whatsapp.token' => 'test_token',
        'services.whatsapp.phone_id' => 'env_phone_id',
    ]);

    $response = $this->postJson('/api/webhook/whatsapp', $payload);

    $response->assertStatus(200)
        ->assertJson(['status' => 'OK', 'result' => 'Queued']);

    Queue::assertPushed(ProcessPendingChatsJob::class);

    $this->assertDatabaseHas('pending_chats', [
        'message_id' => 'wamid.test_msg_id_123',
        'from' => '628987654321',
        'phone_id' => 'custom_phone_id_987',
        'agent_phone' => '628123456789',
        'client_phone' => '628987654321',
        'profile_name' => 'John Doe',
        'status' => 'pending',
    ]);

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), '/custom_phone_id_987/messages') &&
            $request['status'] === 'read' &&
            $request['message_id'] === 'wamid.test_msg_id_123';
    });
});

test('whatsapp services processBatch sends response using dynamic phone_id stored in database', function () {
    Http::fake([
        'https://graph.facebook.com/*' => Http::response(['success' => true], 200),
    ]);

    $salesAssistMock = Mockery::mock(SalesAssistService::class);
    $salesAssistMock->shouldReceive('analyze')
        ->once()
        ->andReturn([
            'message' => 'Halo John, ini balasan AI.',
            'recommendations' => [],
            'conversation_id' => 'conv_abc',
        ]);
    $this->app->instance(SalesAssistService::class, $salesAssistMock);

    // Pre-create the conversation in database to avoid title constraint error during updateOrCreate
    AgentConversation::forceCreate([
        'id' => 'conv_abc',
        'title' => 'Test Conversation',
    ]);

    $chat = PendingChat::create([
        'message_id' => 'wamid.test_msg_id_999',
        'from' => '628987654321',
        'body' => 'Tanya dong',
        'phone_id' => 'custom_phone_id_abc',
        'agent_phone' => '628123456789',
        'client_phone' => '628987654321',
        'profile_name' => 'John Doe',
        'status' => 'pending',
    ]);

    config([
        'services.whatsapp.token' => 'test_token',
        'services.whatsapp.phone_id' => 'env_phone_id',
    ]);

    $job = new ProcessPendingChatsJob;
    $job->handle(app(WhatsAppServices::class));

    $chat->refresh();
    expect($chat->status)->toBe('done');
    expect($chat->response_message)->toBe('Halo John, ini balasan AI.');

    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), '/custom_phone_id_abc/messages') &&
            $request['to'] === '628987654321' &&
            $request['text']['body'] === 'Halo John, ini balasan AI.';
    });
});

test('whatsapp webhook logs status callbacks without processing them as incoming messages', function () {
    Log::spy();

    $payload = [
        'object' => 'whatsapp_business_account',
        'entry' => [
            [
                'id' => '123456789',
                'changes' => [
                    [
                        'value' => [
                            'messaging_product' => 'whatsapp',
                            'metadata' => [
                                'display_phone_number' => '628123456789',
                                'phone_number_id' => 'custom_phone_id_987',
                            ],
                            'contacts' => [
                                [
                                    'wa_id' => '628987654321',
                                ],
                            ],
                            'statuses' => [
                                [
                                    'id' => 'wamid.failed_message',
                                    'status' => 'failed',
                                    'recipient_id' => '628987654321',
                                    'errors' => [
                                        [
                                            'code' => 131047,
                                            'title' => 'Re-engagement message',
                                            'message' => 'More than 24 hours have passed.',
                                            'error_data' => [
                                                'details' => 'Use a message template.',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'field' => 'messages',
                    ],
                ],
            ],
        ],
    ];

    $response = $this->postJson('/api/webhook/whatsapp', $payload);

    $response->assertOk()
        ->assertJson(['status' => 'OK']);

    $this->assertDatabaseCount('pending_chats', 0);

    Log::shouldHaveReceived('warning')
        ->once()
        ->with('WhatsApp message status update', Mockery::on(fn (array $context) => $context['message_id'] === 'wamid.failed_message'
            && $context['status'] === 'failed'
            && $context['recipient_id'] === '628987654321'
            && $context['phone_id'] === 'custom_phone_id_987'
            && $context['error_code'] === 131047
            && $context['error_title'] === 'Re-engagement message'
            && $context['error_message'] === 'More than 24 hours have passed.'
            && $context['error_details'] === 'Use a message template.'));
});
