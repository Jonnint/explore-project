<?php

use App\Models\PendingChat;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

function whatsappTemplateUser(): User
{
    return User::factory()->create(['phone' => '628'.fake()->unique()->numerify('##########')]);
}

function configureWhatsAppTemplates(array $overrides = []): void
{
    config(array_merge([
        'services.whatsapp.token' => 'test_whatsapp_token',
        'services.whatsapp.phone_id' => 'configured_phone_id',
        'services.whatsapp.business_account_id' => 'waba_123',
        'services.whatsapp.api_version' => 'v25.0',
    ], $overrides));
}

test('agent can list whatsapp templates', function () {
    configureWhatsAppTemplates();
    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'data' => [
                [
                    'id' => 'template_123',
                    'name' => 'follow_up_customer',
                    'status' => 'APPROVED',
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->getJson('/api/whatsapp/templates');

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Templates retrieved successfully.',
        ])
        ->assertJsonPath('data.data.0.id', 'template_123');

    Http::assertSent(fn (Request $request) => $request->method() === 'GET'
        && $request->url() === 'https://graph.facebook.com/v25.0/waba_123/message_templates');
});

test('agent can create body only whatsapp template with named parameter format', function () {
    configureWhatsAppTemplates();
    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'id' => 'template_123',
            'status' => 'PENDING',
            'category' => 'marketing',
        ], 200),
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->postJson('/api/whatsapp/templates', [
            'name' => 'follow_up_customer',
            'language' => 'id',
            'category' => 'marketing',
            'body' => 'Halo, kami ingin follow up terkait produk kami.',
        ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Template submitted successfully.',
        ])
        ->assertJsonPath('data.id', 'template_123');

    Http::assertSent(function (Request $request) {
        return $request->method() === 'POST'
            && $request->url() === 'https://graph.facebook.com/v25.0/waba_123/message_templates'
            && $request['name'] === 'follow_up_customer'
            && $request['language'] === 'id'
            && $request['category'] === 'marketing'
            && $request['parameter_format'] === 'NAMED'
            && $request['components'] === [
                [
                    'type' => 'body',
                    'text' => 'Halo, kami ingin follow up terkait produk kami.',
                ],
            ];
    });
});

test('agent can create whatsapp template with named params footer and buttons', function () {
    configureWhatsAppTemplates();
    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'id' => 'template_456',
            'status' => 'PENDING',
            'category' => 'marketing',
        ], 200),
    ]);

    $payload = [
        'name' => 'follow_up_customer',
        'language' => 'id',
        'category' => 'marketing',
        'body' => 'Halo {{customer_name}}, kami ingin follow up terkait produk kami.',
        'body_params' => [
            [
                'param_name' => 'customer_name',
                'example' => 'Budi',
            ],
        ],
        'footer' => 'Balas pesan ini jika berminat.',
        'buttons' => [
            [
                'type' => 'quick_reply',
                'text' => 'Saya tertarik',
            ],
            [
                'type' => 'url',
                'text' => 'Lihat Produk',
                'url' => 'https://example.com/products',
            ],
            [
                'type' => 'phone_number',
                'text' => 'Hubungi Admin',
                'phone_number' => '628123456789',
            ],
        ],
    ];

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->postJson('/api/whatsapp/templates', $payload);

    $response->assertOk()
        ->assertJsonPath('data.id', 'template_456');

    Http::assertSent(function (Request $request) {
        return $request['components'] === [
            [
                'type' => 'body',
                'text' => 'Halo {{customer_name}}, kami ingin follow up terkait produk kami.',
                'example' => [
                    'body_text_named_params' => [
                        [
                            'param_name' => 'customer_name',
                            'example' => 'Budi',
                        ],
                    ],
                ],
            ],
            [
                'type' => 'footer',
                'text' => 'Balas pesan ini jika berminat.',
            ],
            [
                'type' => 'buttons',
                'buttons' => [
                    [
                        'type' => 'quick_reply',
                        'text' => 'Saya tertarik',
                    ],
                    [
                        'type' => 'url',
                        'text' => 'Lihat Produk',
                        'url' => 'https://example.com/products',
                    ],
                    [
                        'type' => 'phone_number',
                        'text' => 'Hubungi Admin',
                        'phone_number' => '628123456789',
                    ],
                ],
            ],
        ];
    });
});

test('agent can get whatsapp template detail', function () {
    configureWhatsAppTemplates();
    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'id' => 'template_123',
            'name' => 'follow_up_customer',
            'status' => 'APPROVED',
        ], 200),
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->getJson('/api/whatsapp/templates/template_123');

    $response->assertOk()
        ->assertJsonPath('data.id', 'template_123');

    Http::assertSent(fn (Request $request) => $request->method() === 'GET'
        && $request->url() === 'https://graph.facebook.com/v25.0/template_123');
});

test('agent can delete whatsapp template', function () {
    configureWhatsAppTemplates();
    Http::fake([
        'https://graph.facebook.com/*' => Http::response(['success' => true], 200),
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->deleteJson('/api/whatsapp/templates/template_123');

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Template deleted successfully.',
        ]);

    Http::assertSent(fn (Request $request) => $request->method() === 'DELETE'
        && $request->url() === 'https://graph.facebook.com/v25.0/template_123');
});

test('agent can send whatsapp template message with named body params', function () {
    configureWhatsAppTemplates();
    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'messaging_product' => 'whatsapp',
            'contacts' => [
                [
                    'input' => '6285333779294',
                    'wa_id' => '6285333779294',
                ],
            ],
            'messages' => [
                [
                    'id' => 'wamid.template_123',
                    'message_status' => 'accepted',
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->postJson('/api/whatsapp/send-template', [
            'to' => '6285333779294',
            'template_name' => 'follow_up_customer',
            'language' => 'id',
            'body_params' => [
                [
                    'parameter_name' => 'customer_name',
                    'text' => 'Budi',
                ],
            ],
        ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Template message sent successfully.',
        ])
        ->assertJsonPath('data.messages.0.id', 'wamid.template_123');

    Http::assertSent(function (Request $request) {
        return $request->method() === 'POST'
            && $request->url() === 'https://graph.facebook.com/v25.0/configured_phone_id/messages'
            && $request['messaging_product'] === 'whatsapp'
            && $request['recipient_type'] === 'individual'
            && $request['to'] === '6285333779294'
            && $request['type'] === 'template'
            && $request['template'] === [
                'name' => 'follow_up_customer',
                'language' => [
                    'code' => 'id',
                ],
                'components' => [
                    [
                        'type' => 'body',
                        'parameters' => [
                            [
                                'type' => 'text',
                                'parameter_name' => 'customer_name',
                                'text' => 'Budi',
                            ],
                        ],
                    ],
                ],
            ];
    });
});

test('send template falls back to latest pending chat phone id when configured phone id is empty', function () {
    configureWhatsAppTemplates(['services.whatsapp.phone_id' => null]);
    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'messages' => [
                ['id' => 'wamid.template_456'],
            ],
        ], 200),
    ]);

    $user = whatsappTemplateUser();

    PendingChat::create([
        'message_id' => 'wamid.latest_template',
        'from' => '628000000002',
        'body' => 'Latest message',
        'agent_phone' => $user->phone,
        'phone_id' => 'agent_phone_id',
        'status' => 'done',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/whatsapp/send-template', [
            'to' => '6285333779294',
            'template_name' => 'follow_up_customer',
            'language' => 'id',
        ]);

    $response->assertOk();

    Http::assertSent(fn (Request $request) => $request->url() === 'https://graph.facebook.com/v25.0/agent_phone_id/messages');
});

test('template APIs validate required fields and button requirements', function () {
    configureWhatsAppTemplates();
    $user = whatsappTemplateUser();

    $createResponse = $this->actingAs($user, 'sanctum')
        ->postJson('/api/whatsapp/templates', [
            'name' => 'Invalid Name',
            'language' => '',
            'category' => '',
            'body' => '',
        ]);

    $createResponse->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'language', 'category', 'body']);

    $buttonResponse = $this->actingAs($user, 'sanctum')
        ->postJson('/api/whatsapp/templates', [
            'name' => 'follow_up_customer',
            'language' => 'id',
            'category' => 'marketing',
            'body' => 'Halo.',
            'buttons' => [
                [
                    'type' => 'url',
                    'text' => 'Lihat Produk',
                ],
            ],
        ]);

    $buttonResponse->assertUnprocessable()
        ->assertJsonValidationErrors(['buttons.0.url']);

    $sendResponse = $this->actingAs($user, 'sanctum')
        ->postJson('/api/whatsapp/send-template', [
            'to' => '',
            'template_name' => '',
            'language' => '',
        ]);

    $sendResponse->assertUnprocessable()
        ->assertJsonValidationErrors(['to', 'template_name', 'language']);
});

test('template APIs return config errors', function () {
    configureWhatsAppTemplates([
        'services.whatsapp.token' => null,
        'services.whatsapp.business_account_id' => 'waba_123',
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->getJson('/api/whatsapp/templates');

    $response->assertUnprocessable()
        ->assertJson([
            'success' => false,
            'message' => 'WhatsApp token is not configured.',
        ]);

    configureWhatsAppTemplates([
        'services.whatsapp.token' => 'test_whatsapp_token',
        'services.whatsapp.business_account_id' => null,
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->getJson('/api/whatsapp/templates');

    $response->assertUnprocessable()
        ->assertJson([
            'success' => false,
            'message' => 'WhatsApp business account ID is not configured.',
        ]);
});

test('send template returns phone id config error', function () {
    configureWhatsAppTemplates(['services.whatsapp.phone_id' => null]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->postJson('/api/whatsapp/send-template', [
            'to' => '6285333779294',
            'template_name' => 'follow_up_customer',
            'language' => 'id',
        ]);

    $response->assertUnprocessable()
        ->assertJson([
            'success' => false,
            'message' => 'WhatsApp phone ID is not configured.',
        ]);
});

test('template APIs return meta errors', function () {
    configureWhatsAppTemplates();
    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'error' => [
                'message' => 'Template name already exists.',
            ],
        ], 400),
    ]);

    $response = $this->actingAs(whatsappTemplateUser(), 'sanctum')
        ->postJson('/api/whatsapp/templates', [
            'name' => 'follow_up_customer',
            'language' => 'id',
            'category' => 'marketing',
            'body' => 'Halo.',
        ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'Template name already exists.',
        ]);
});
