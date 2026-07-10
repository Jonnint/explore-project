<?php

namespace App\Services;

use App\Ai\Agents\SalesAssist;
use App\Models\KnowledgeBase;
use App\Models\Product;
use App\Models\ShortLink;
use App\Models\User;
use App\Notifications\ProductAlertNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Ai\Responses\AgentResponse;
use Throwable;

class SalesAssistService
{
    public function analyze(
        ?string $conversationId = null,
        string $transcript = '',
        ?string $agentPhone = null,
        ?string $clientPhone = null,
        ?string $profileName = null,
        int $userId = 1
    ): array {
        $agent = new SalesAssist;
        $user = User::find($userId);

        if ($conversationId) {
            $agent = $agent->continue($conversationId, $user);
        } else {
            $agent = $agent->forUser($user);
        }

        if ($profileName) {
            $agent->clientName = $profileName;
        }

        $kbContext = $this->getKnowledgeBaseContext($transcript);

        $enrichedTranscript = $kbContext
            ? "[KNOWLEDGE BASE CONTEXT]\n{$kbContext}\n\n[CUSTOMER MESSAGE]\n{$transcript}"
            : $transcript;

        try {
            $response = $agent->prompt($enrichedTranscript);

            $data = $this->parseResponse($response, $transcript, $profileName, $conversationId);
        } catch (Throwable $e) {
            Log::error('SalesAssist error', [
                'message' => $e->getMessage(),
                'transcript' => $transcript,
                'conversation_id' => $conversationId,
            ]);

            return [
                'message' => 'Maaf, asisten sedang sibuk. Coba lagi dalam beberapa saat ya!',
                'recommendations' => [],
                'conversation_id' => $conversationId,
            ];
        }

        $resolvedConversationId = $response->conversationId ?? $conversationId;

        $updated = $this->processRecommendations($data['recommendations'], $resolvedConversationId, $agentPhone, $clientPhone, $profileName);

        return [
            'message' => $data['message'],
            'recommendations' => $updated,
            'conversation_id' => $resolvedConversationId,
        ];
    }

    private function parseResponse(
        AgentResponse $response,
        string $transcript,
        ?string $profileName,
        ?string $conversationId
    ): array {
        $text = $response->text ?? '';

        $cleanedText = trim(preg_replace('/^```(?:json)?\s*|\s*```$/m', '', $text));

        $data = [];
        if (! empty($cleanedText)) {
            $decoded = json_decode($cleanedText, true);
            if (is_array($decoded) && isset($decoded['message'])) {
                $data = $decoded;
            }
        }

        if (empty($data) || ! isset($data['message'])) {
            $data = [
                'message' => $this->generateFallbackMessage($transcript, $profileName),
                'recommendations' => [],
            ];
        }

        $data['message'] = trim(preg_replace(
            ['/https?:\/\/\S+/', '/\s+/'],
            ['', ' '],
            $data['message']
        ));

        Log::info('SalesAssist response debug', [
            'text_raw' => $text,
            'text_cleaned' => $cleanedText,
            'data_final' => $data,
            'transcript' => $transcript,
            'conversation_id' => $conversationId,
        ]);

        return [
            'message' => $data['message'] ?? 'Ada yang bisa saya bantu?',
            'recommendations' => $data['recommendations'] ?? [],
        ];
    }

    private function processRecommendations(
        array $recommendations,
        ?string $resolvedConversationId,
        string $agentPhone,
        string $clientPhone,
        ?string $profileName
    ): array {
        $updated = [];

        foreach ($recommendations as $rec) {
            if (empty($rec['id']) || empty($rec['slug'])) {
                Log::warning('SalesAssist: skipping malformed recommendation', ['rec' => $rec]);

                continue;
            }

            // Check if there is already an existing short link for this client and product in the current session
            $existing = ShortLink::where('product_slug', $rec['slug'])
                ->where('client_phone', $clientPhone)
                ->where(function ($query) use ($resolvedConversationId) {
                    if ($resolvedConversationId) {
                        $query->where('conversation_id', $resolvedConversationId);
                    } else {
                        $query->whereNull('conversation_id');
                    }
                })
                ->first();

            if ($existing) {
                $code = $existing->code;
            } else {
                Product::where('id', $rec['id'])->increment('recommendation_count');

                $user = User::where('phone', $agentPhone)->first();

                if ($user) {
                    $user->notify(new ProductAlertNotification(
                        productName: $rec['name'],
                        productId: (int) $rec['id'],
                        agentPhone: $agentPhone,
                    ));
                }

                $code = Str::random(10);

                ShortLink::create([
                    'code' => $code,
                    'product_slug' => $rec['slug'],
                    'conversation_id' => $resolvedConversationId,
                    'agent_phone' => $agentPhone,
                    'client_phone' => $clientPhone,
                    'profile_name' => $profileName,
                ]);
            }

            $updated[] = [
                'name' => $rec['name'],
                'url' => rtrim(config('app.url'), '/').'/s/'.$code,
                'price' => $rec['price'],
            ];
        }

        return $updated;
    }

    private function getKnowledgeBaseContext(string $transcript): string
    {
        $words = preg_split('/[^\p{L}\p{N}]+/u', $transcript, -1, PREG_SPLIT_NO_EMPTY);
        $keywords = array_filter($words, fn ($w) => mb_strlen($w) > 3);
        $keywords = array_slice(array_unique($keywords), 0, 10);

        $entries = KnowledgeBase::active()
            ->search(implode(' ', $keywords))
            ->limit(5)
            ->get();

        if ($entries->isEmpty()) {
            return '';
        }

        return $entries->map(fn ($entry) => sprintf(
            "[%s] %s\n%s",
            strtoupper($entry->category),
            $entry->title,
            $entry->content['body'] ?? ''
        ))->implode("\n\n---\n\n");
    }

    private function generateFallbackMessage(string $transcript, ?string $profileName = null): string
    {
        $name = $profileName ?: '';

        $patterns = [
            '/\bsusah tidur\b|\binsomnia\b|\btidur\b/i' => fn () => $name
                ? "Maaf $name, saya kurang paham keluhan Anda. Bisa dijelaskan lebih detail? Ada produk tertentu yang ingin dicari?"
                : 'Maaf, saya kurang paham keluhan Anda. Bisa dijelaskan lebih detail? Ada produk tertentu yang ingin dicari?',
            '/\bsakit\b|\bdemam\b|\bbatuk\b|\bpusing\b|\bflu\b/i' => fn () => $name
                ? "Wah $name, semoga cepat sembuh ya. Ada yang bisa saya bantu?"
                : 'Wah, semoga cepat sembuh ya. Ada yang bisa saya bantu?',
            '/\blelah\b|\bcapek\b|\blesu\b|\blemas\b/i' => 'Istirahat yang cukup ya. Ada yang bisa saya bantu hari ini?',
        ];

        foreach ($patterns as $pattern => $message) {
            if (preg_match($pattern, $transcript)) {
                return is_callable($message) ? $message() : $message;
            }
        }

        return 'Ada yang bisa saya bantu?';
    }
}
