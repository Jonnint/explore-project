<?php

namespace App\Services;

use App\Models\AgentConversation;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\NewLeadNotification;
use App\Notifications\NewMessageNotification;
use App\Notifications\ProcessingFailedNotification;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppServices
{
    protected ?string $token;

    protected ?string $phoneId;

    protected ?string $businessAccountId;

    protected string $apiVersion;

    public function __construct(
        protected SalesAssistService $salesAssist
    ) {
        $this->token = config('services.whatsapp.token');
        $this->phoneId = config('services.whatsapp.phone_id');
        $this->businessAccountId = config('services.whatsapp.business_account_id');
        $this->apiVersion = config('services.whatsapp.api_version', 'v25.0');
    }

    public function setPhoneId(?string $phoneId): self
    {
        if (! empty($phoneId)) {
            $this->phoneId = $phoneId;
        }

        return $this;
    }

    public function sendMessage(string $to, string $message): array
    {
        $response = Http::withToken($this->token)
            ->post("https://graph.facebook.com/{$this->apiVersion}/{$this->phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'type' => 'text',
                'text' => ['body' => $message],
            ]);

        return $response->json();
    }

    /**
     * @return array{success: bool, message: string, status: int, data: array<string, mixed>|null}
     */
    public function sendManualTextMessage(string $phoneId, string $to, string $body): array
    {
        $response = Http::withToken($this->token)
            ->post("https://graph.facebook.com/{$this->apiVersion}/{$phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'text',
                'text' => [
                    'body' => $body,
                ],
            ]);

        $data = $response->json();

        if ($response->failed()) {
            return [
                'success' => false,
                'message' => $data['error']['message'] ?? 'Failed to send WhatsApp message.',
                'status' => $response->status() >= 500 ? 502 : 400,
                'data' => $data,
            ];
        }

        return [
            'success' => true,
            'message' => 'Message sent successfully.',
            'status' => 200,
            'data' => $data,
        ];
    }

    /**
     * @return array{success: bool, message: string, status: int, data: array<string, mixed>|null}
     */
    public function listMessageTemplates(): array
    {
        $response = Http::withToken($this->token)
            ->get("https://graph.facebook.com/{$this->apiVersion}/{$this->businessAccountId}/message_templates");

        return $this->formatMetaResponse($response, 'Templates retrieved successfully.', 'Failed to retrieve WhatsApp templates.');
    }

    /**
     * @param  array{name: string, language: string, category: string, body: string, body_params?: array<int, array{param_name: string, example: string}>, footer?: string|null, buttons?: array<int, array{type: string, text: string, url?: string|null, phone_number?: string|null}>}  $template
     * @return array{success: bool, message: string, status: int, data: array<string, mixed>|null}
     */
    public function createMessageTemplate(array $template): array
    {
        $components = [
            [
                'type' => 'body',
                'text' => $template['body'],
            ],
        ];

        if (! empty($template['body_params'])) {
            $components[0]['example'] = [
                'body_text_named_params' => collect($template['body_params'])
                    ->map(fn (array $param) => [
                        'param_name' => $param['param_name'],
                        'example' => $param['example'],
                    ])
                    ->values()
                    ->all(),
            ];
        }

        if (! empty($template['footer'])) {
            $components[] = [
                'type' => 'footer',
                'text' => $template['footer'],
            ];
        }

        if (! empty($template['buttons'])) {
            $components[] = [
                'type' => 'buttons',
                'buttons' => collect($template['buttons'])
                    ->map(function (array $button) {
                        $type = $button['type'];

                        return match ($type) {
                            'url' => [
                                'type' => 'url',
                                'text' => $button['text'],
                                'url' => $button['url'],
                            ],
                            'phone_number' => [
                                'type' => 'phone_number',
                                'text' => $button['text'],
                                'phone_number' => $button['phone_number'],
                            ],
                            default => [
                                'type' => 'quick_reply',
                                'text' => $button['text'],
                            ],
                        };
                    })
                    ->values()
                    ->all(),
            ];
        }

        $response = Http::withToken($this->token)
            ->post("https://graph.facebook.com/{$this->apiVersion}/{$this->businessAccountId}/message_templates", [
                'name' => $template['name'],
                'language' => $template['language'],
                'category' => $template['category'],
                'parameter_format' => 'NAMED',
                'components' => $components,
            ]);

        return $this->formatMetaResponse($response, 'Template submitted successfully.', 'Failed to create WhatsApp template.');
    }

    /**
     * @return array{success: bool, message: string, status: int, data: array<string, mixed>|null}
     */
    public function getMessageTemplate(string $templateId): array
    {
        $response = Http::withToken($this->token)
            ->get("https://graph.facebook.com/{$this->apiVersion}/{$templateId}");

        return $this->formatMetaResponse($response, 'Template retrieved successfully.', 'Failed to retrieve WhatsApp template.');
    }

    /**
     * @return array{success: bool, message: string, status: int, data: array<string, mixed>|null}
     */
    public function deleteMessageTemplate(string $templateId): array
    {
        $response = Http::withToken($this->token)
            ->delete("https://graph.facebook.com/{$this->apiVersion}/{$templateId}");

        return $this->formatMetaResponse($response, 'Template deleted successfully.', 'Failed to delete WhatsApp template.');
    }

    /**
     * @param  array<int, array{parameter_name: string, text: string}>  $bodyParams
     * @return array{success: bool, message: string, status: int, data: array<string, mixed>|null}
     */
    public function sendTemplateMessage(string $phoneId, string $to, string $templateName, string $language, array $bodyParams = []): array
    {
        $template = [
            'name' => $templateName,
            'language' => [
                'code' => $language,
            ],
        ];

        if (! empty($bodyParams)) {
            $template['components'] = [
                [
                    'type' => 'body',
                    'parameters' => collect($bodyParams)
                        ->map(fn (array $param) => [
                            'type' => 'text',
                            'parameter_name' => $param['parameter_name'],
                            'text' => $param['text'],
                        ])
                        ->values()
                        ->all(),
                ],
            ];
        }

        $response = Http::withToken($this->token)
            ->post("https://graph.facebook.com/{$this->apiVersion}/{$phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'template',
                'template' => $template,
            ]);

        return $this->formatMetaResponse($response, 'Template message sent successfully.', 'Failed to send WhatsApp template message.');
    }

    /**
     * @return array{success: bool, message: string, status: int, data: array<string, mixed>|null}
     */
    private function formatMetaResponse($response, string $successMessage, string $fallbackErrorMessage): array
    {
        $data = $response->json();

        if ($response->failed()) {
            return [
                'success' => false,
                'message' => $data['error']['message'] ?? $fallbackErrorMessage,
                'status' => $response->status() >= 500 ? 502 : 400,
                'data' => $data,
            ];
        }

        return [
            'success' => true,
            'message' => $successMessage,
            'status' => 200,
            'data' => $data,
        ];
    }

    public function sendTypingOn(string $messageId): void
    {
        try {
            $response = Http::withToken($this->token)
                ->post("https://graph.facebook.com/{$this->apiVersion}/{$this->phoneId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'status' => 'read',
                    'message_id' => $messageId,
                    'typing_indicator' => [
                        'type' => 'text',
                    ],
                ]);

            if ($response->failed()) {
                Log::error('Failed to send typing indicator API response', [
                    'message_id' => $messageId,
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                ]);
            } else {
                Log::debug('Sent typing indicator successfully', [
                    'message_id' => $messageId,
                    'response' => $response->json(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception when sending typing indicator', [
                'message_id' => $messageId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function processBatch(iterable $chats): void
    {
        $tasks = [];
        foreach ($chats as $chat) {
            $tasks[$chat->id] = function () use ($chat) {
                $lead = Lead::firstOrCreate(
                    ['phone_number' => $chat->from],
                    ['name' => $chat->profile_name, 'agent_phone' => $chat->agent_phone]
                );

                if ($lead->wasRecentlyCreated) {
                    $this->notifyAgent($chat->agent_phone, new NewLeadNotification(
                        profileName: $chat->profile_name ?? $chat->from,
                        agentPhone: $chat->agent_phone,
                        leadId: $lead->id,
                    ));
                }

                $conversationId = null;
                if ($lead->last_message_at && $lead->last_message_at->diffInMinutes(now()) <= 10) {
                    $lastConversation = $lead->conversations()->latest()->first();
                    $conversationId = $lastConversation?->id;
                }

                return $this->salesAssist->analyze(
                    $conversationId,
                    $chat->body,
                    $chat->agent_phone,
                    $chat->client_phone,
                    $chat->profile_name
                );
            };
        }

        try {
            $results = Concurrency::run($tasks);
        } catch (\Throwable $e) {
            Log::error('Batch concurrency execution failed, falling back to sequential execution', [
                'error' => $e->getMessage(),
            ]);
            $results = [];
            foreach ($tasks as $id => $task) {
                try {
                    $results[$id] = $task();
                } catch (\Throwable $ex) {
                    Log::error("Sequential task $id failed", ['error' => $ex->getMessage()]);
                    $results[$id] = null;
                }
            }
        }

        foreach ($chats as $chat) {
            $result = $results[$chat->id] ?? null;

            if (! $result) {
                $chat->update(['status' => 'failed']);

                $this->notifyAgent($chat->agent_phone, new ProcessingFailedNotification(
                    agentPhone: $chat->agent_phone,
                    errorPreview: 'Chat processing returned no result',
                    context: "chat_id: {$chat->id}, from: {$chat->from}",
                ));

                continue;
            }

            $reply = $result['message'];

            $lead = Lead::where('phone_number', $chat->from)->first();
            if ($result['conversation_id'] && $lead) {
                AgentConversation::updateOrCreate(
                    ['id' => $result['conversation_id']],
                    ['lead_id' => $lead->id]
                );
            }

            if ($lead) {
                $wasExisting = ! empty($lead->messages);
                $messages = $lead->messages ?? [];
                $messages[] = [
                    'wa_message_id' => $chat->message_id,
                    'conversation_id' => $result['conversation_id'],
                    'from' => $chat->from,
                    'body' => $chat->body,
                    'role' => 'user',
                    'sent_at' => now()->toIso8601String(),
                    'ai_response' => $result['message'],
                    'ai_recommendations' => $result['recommendations'],
                ];
                $lead->messages = $messages;
                $lead->last_message_at = now();
                $lead->save();

                if ($wasExisting) {
                    $preview = mb_substr($chat->body, 0, 60);
                    $this->notifyAgent($chat->agent_phone, new NewMessageNotification(
                        profileName: $chat->profile_name ?? $chat->from,
                        agentPhone: $chat->agent_phone,
                        leadId: $lead->id,
                        messagePreview: $preview,
                    ));
                }

                app(LeadService::class)->updateLeadStatus($lead);
            }

            if (! empty($result['recommendations'])) {
                $reply .= "\n\n*Rekomendasi produk:*";
                foreach ($result['recommendations'] as $rec) {
                    $reply .= "\n• {$rec['name']} - Rp ".number_format($rec['price'], 0, ',', '.')."\n  {$rec['url']}";
                }
            }

            if (! empty($chat->phone_id)) {
                $this->setPhoneId($chat->phone_id);
            } else {
                $this->setPhoneId(config('services.whatsapp.phone_id'));
            }

            $this->sendMessage($chat->from, $reply);

            $chat->update([
                'status' => 'done',
                'response_message' => $reply,
                'response_recommendations' => $result['recommendations'],
            ]);
        }
    }

    private function notifyAgent(string $agentPhone, mixed $notification): void
    {
        $user = User::where('phone', $agentPhone)->first();

        if ($user) {
            $user->notify($notification);
        }
    }

    public function testConnection(): array
    {
        if (empty($this->token) || empty($this->phoneId)) {
            return [
                'success' => false,
                'message' => 'WhatsApp Token or Phone ID is not configured in .env file.',
            ];
        }

        try {
            $response = Http::withToken($this->token)
                ->get("https://graph.facebook.com/{$this->apiVersion}/{$this->phoneId}");

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'message' => 'Connection successful.',
                    'data' => [
                        'id' => $data['id'] ?? $this->phoneId,
                        'display_phone_number' => $data['display_phone_number'] ?? null,
                        'verified_name' => $data['verified_name'] ?? null,
                        'quality_rating' => $data['quality_rating'] ?? null,
                    ],
                ];
            }

            $error = $response->json()['error']['message'] ?? 'Unknown Facebook API error';

            return [
                'success' => false,
                'message' => 'Facebook API Error: '.$error,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Connection failed: '.$e->getMessage(),
            ];
        }
    }
}
