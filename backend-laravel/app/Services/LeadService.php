<?php

namespace App\Services;

use App\Ai\Agents\LeadInsightAgent;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\LeadStatusChangedNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Responses\StructuredAgentResponse;
use Throwable;

use function Illuminate\Support\now;

class LeadService
{
    public function updateLeadStatus(Lead $lead): void
    {
        $oldStatus = $lead->status;

        if (! $lead->last_message_at) {
            $lead->status = LeadStatus::Cold->value;
            $lead->save();

            return;
        }

        $hoursSinceLastMessage = abs(Carbon::now()->diffInHours($lead->last_message_at));

        if ($hoursSinceLastMessage < 24) {
            $lead->status = LeadStatus::Hot->value;
        } elseif ($hoursSinceLastMessage < 48) {
            $lead->status = LeadStatus::Warm->value;
        } else {
            $lead->status = LeadStatus::Cold->value;
        }

        $lead->save();

        if ($lead->status !== $oldStatus && $lead->agent_phone) {
            $user = User::where('phone', $lead->agent_phone)->first();

            if ($user) {
                $user->notify(new LeadStatusChangedNotification(
                    leadId: $lead->id,
                    leadName: $lead->name ?? $lead->phone_number,
                    oldStatus: $oldStatus,
                    newStatus: $lead->status,
                    agentPhone: $lead->agent_phone,
                ));
            }
        }
    }

    public function updateAllLeadStatuses(): int
    {
        $leads = Lead::all();
        $updated = 0;

        foreach ($leads as $lead) {
            $oldStatus = $lead->status;
            $this->updateLeadStatus($lead);
            if ($oldStatus !== $lead->status) {
                $updated++;
            }
        }

        return $updated;
    }

    public function getLeadsByStatus(LeadStatus $status, string $agentPhone, int $limit = 10): array
    {
        return Lead::where('status', $status->value)
            ->where('agent_phone', $agentPhone)
            ->orderByDesc('last_message_at')
            ->limit($limit)
            ->get()
            ->map(fn ($lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'phone_number' => $lead->phone_number,
                'product' => $lead->product,
                'status' => $lead->status,
                'last_message_at' => $lead->last_message_at?->diffForHumans(),
            ])
            ->toArray();
    }

    public function getLeadStats(string $agentPhone): array
    {
        return [
            'hot' => Lead::where('status', LeadStatus::Hot->value)->where('agent_phone', $agentPhone)->count(),
            'warm' => Lead::where('status', LeadStatus::Warm->value)->where('agent_phone', $agentPhone)->count(),
            'cold' => Lead::where('status', LeadStatus::Cold->value)->where('agent_phone', $agentPhone)->count(),
            'total' => Lead::where('agent_phone', $agentPhone)->count(),
        ];
    }

    public function updateLastMessageTime(Lead $lead): void
    {
        $lead->last_message_at = now();
        $lead->save();
        $this->updateLeadStatus($lead);
    }

    public function getLeadsWithConversations(string $agentPhone, ?LeadStatus $status = null): array
    {
        $query = Lead::where('agent_phone', $agentPhone)
            ->withCount('conversations')
            ->orderByDesc('last_message_at');

        if ($status) {
            $query->where('status', $status->value);
        }

        return $query->get()
            ->map(function ($lead) {
                $messages = $lead->messages ?? [];
                $lastMsg = empty($messages) ? null : end($messages);
                $lastMessageText = $lastMsg ? ($lastMsg['body'] ?? null) : null;

                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'phone_number' => $lead->phone_number,
                    'product' => $lead->product,
                    'status' => $lead->status,
                    'last_message_at' => $lead->last_message_at?->diffForHumans(),
                    'conversations_count' => $lead->conversations_count,
                    'last_message' => $lastMessageText,
                ];
            })
            ->toArray();
    }

    public function getLeadWithMessages(int $leadId, string $agentPhone, bool $forceRefresh = false): ?array
    {
        $lead = Lead::where('id', $leadId)
            ->where('agent_phone', $agentPhone)
            ->with(['conversations'])
            ->first();

        if (! $lead) {
            return null;
        }

        $chatLines = [];
        $messages = $lead->messages ?? [];
        foreach ($messages as $msg) {
            if (! empty($msg['body'])) {
                $chatLines[] = "Customer: {$msg['body']}";
            }
            if (! empty($msg['ai_response'])) {
                $chatLines[] = "SalesCareAI: {$msg['ai_response']}";
            }
        }
        $transcript = implode("\n", array_slice($chatLines, -15));

        $cacheKey = 'lead_insights_'.$leadId;

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        $insights = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($transcript) {
            try {
                if (empty($transcript)) {
                    return [
                        'summary' => 'Belum ada percakapan dengan lead ini.',
                        'purchase_readiness' => 'Rendah',
                        'sentiment' => 'netral',
                        'suggested_action' => 'Kirim pesan pertama untuk menyapa lead.',
                    ];
                }

                $agent = new LeadInsightAgent;
                $prompt = "Berikut adalah transkrip percakapan WhatsApp terakhir dengan lead:\n\n{$transcript}\n\nAnalisis percakapan di atas dan berikan data insight sesuai instruksi.";
                $response = $agent->prompt($prompt);

                /** @var StructuredAgentResponse $response */
                if (isset($response['summary'], $response['purchase_readiness'], $response['sentiment'], $response['suggested_action'])) {
                    return [
                        'summary' => $response['summary'],
                        'purchase_readiness' => $response['purchase_readiness'],
                        'sentiment' => $response['sentiment'],
                        'suggested_action' => $response['suggested_action'],
                    ];
                }
            } catch (Throwable $e) {
                Log::error('Failed to generate lead insights via AI', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }

            return [
                'summary' => 'Tertarik bertanya tentang produk kami. Belum ada keputusan pembelian.',
                'purchase_readiness' => 'Sedang',
                'sentiment' => 'netral',
                'suggested_action' => 'Hubungi kembali untuk memberikan bantuan lebih lanjut.',
            ];
        });

        // Group messages by conversation ID to maintain exact output structure for frontend compatibility
        $grouped = [];
        foreach ($messages as $msg) {
            $convId = $msg['conversation_id'] ?? 'default';
            if (! isset($grouped[$convId])) {
                $grouped[$convId] = [
                    'id' => $convId,
                    'messages' => [],
                ];
            }
            $grouped[$convId]['messages'][] = [
                'id' => $msg['wa_message_id'] ?? null,
                'from' => $msg['from'] ?? $lead->phone_number,
                'body' => $msg['body'] ?? '',
                'role' => $msg['role'] ?? 'user',
                'sent_at' => $msg['sent_at'] ?? null,
                'ai_response' => $msg['ai_response'] ?? null,
                'ai_recommendations' => $msg['ai_recommendations'] ?? null,
            ];
        }

        $conversations = array_values($grouped);

        return [
            'id' => $lead->id,
            'name' => $lead->name,
            'phone_number' => $lead->phone_number,
            'product' => $lead->product,
            'status' => $lead->status,
            'last_message_at' => $lead->last_message_at?->toIso8601String(),
            'conversations' => $conversations,
            'insights' => $insights,
        ];
    }
}
