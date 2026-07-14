<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\PendingChat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class UserDashboardController extends Controller
{
    /**
     * Summary data for user's Beranda page.
     * Returns token usage stats, recent chat history snippets, and recent AI log entries.
     *
     * GET /api/user/dashboard
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $agentPhone = $user->phone;

        return response()->json([
            'token_usage' => $this->buildTokenUsage($user),
            'recent_chat_history' => $this->buildRecentChatHistory($agentPhone),
            'recent_chat_logs' => $this->buildRecentChatLogs($agentPhone, 5),
        ]);
    }

    /**
     * Full AI chat log list with pagination.
     * GET /api/user/chat-logs
     */
    public function chatLogs(Request $request): JsonResponse
    {
        $agentPhone = Auth::user()->phone;
        $perPage = (int) $request->query('per_page', '20');
        $page = (int) $request->query('page', '1');
        $status = $request->query('status');
        $search = $request->query('search');

        $query = PendingChat::where('agent_phone', $agentPhone)
            ->orderByDesc('created_at');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                    ->orWhere('profile_name', 'like', "%{$search}%")
                    ->orWhere('client_phone', 'like', "%{$search}%")
                    ->orWhere('message_id', 'like', "%{$search}%");
            });
        }

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $logs = collect($paginated->items())->map(fn (PendingChat $chat) => $this->formatChatLog($chat));

        return response()->json([
            'logs' => $logs,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Full chat history (leads) with pagination.
     * GET /api/user/chat-history
     */
    public function chatHistory(Request $request): JsonResponse
    {
        $agentPhone = Auth::user()->phone;
        $perPage = (int) $request->query('per_page', '15');
        $page = (int) $request->query('page', '1');
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Lead::where('agent_phone', $agentPhone)
            ->orderByDesc('last_message_at');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $history = collect($paginated->items())->map(fn (Lead $lead) => $this->formatChatHistoryItem($lead));

        return response()->json([
            'history' => $history,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * @param  User  $user
     */
    private function buildTokenUsage(mixed $user): array
    {
        $limit = $user->token_limit;
        $used = (int) ($user->tokens_used ?? 0);

        if ($limit === null) {
            return [
                'limit' => null,
                'used' => $used,
                'remaining' => null,
                'percentage' => 0,
                'status' => 'unlimited',
            ];
        }

        $limit = (int) $limit;
        $remaining = max(0, $limit - $used);
        $percentage = $limit > 0 ? round(($used / $limit) * 100, 1) : 0;

        $status = 'safe';
        if ($percentage >= 90) {
            $status = 'critical';
        } elseif ($percentage >= 70) {
            $status = 'warning';
        }

        return [
            'limit' => $limit,
            'used' => $used,
            'remaining' => $remaining,
            'percentage' => $percentage,
            'status' => $status,
            'reset_at' => Carbon::today()->addDay()->startOfDay()->toIso8601String(),
        ];
    }

    private function buildRecentChatHistory(string $agentPhone, int $limit = 5): array
    {
        return Lead::where('agent_phone', $agentPhone)
            ->orderByDesc('last_message_at')
            ->limit($limit)
            ->get()
            ->map(fn (Lead $lead) => $this->formatChatHistoryItem($lead))
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildRecentChatLogs(string $agentPhone, int $limit = 5): array
    {
        return PendingChat::where('agent_phone', $agentPhone)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (PendingChat $chat) => $this->formatChatLog($chat))
            ->toArray();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatChatHistoryItem(Lead $lead): array
    {
        $messages = $lead->messages ?? [];
        $lastMsg = ! empty($messages) ? end($messages) : null;
        $lastBody = $lastMsg ? ($lastMsg['body'] ?? null) : null;
        $lastRole = $lastMsg ? ($lastMsg['role'] ?? 'user') : null;

        // Determine last sender: user (customer) or AI
        $lastSender = match ($lastRole) {
            'assistant' => 'AI Gemini',
            default => $lead->name ?? $lead->phone_number,
        };

        return [
            'id' => $lead->id,
            'name' => $lead->name ?? 'Tidak Dikenal',
            'phone_number' => $lead->phone_number,
            'last_message' => $lastBody ? mb_substr($lastBody, 0, 80) : 'Belum ada pesan',
            'last_message_at' => $lead->last_message_at?->toIso8601String(),
            'last_message_at_human' => $lead->last_message_at?->diffForHumans(),
            'last_sender' => $lastSender,
            'status' => $lead->status,
            'message_count' => count($messages),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatChatLog(PendingChat $chat): array
    {
        // Derive a simple intent label from message body keywords
        $intent = $this->detectIntent($chat->body);

        // Map status to HTTP-like label
        $apiStatus = match ($chat->status) {
            'done' => '200 OK',
            'failed' => '500 Error',
            'processing' => '102 Processing',
            default => '202 Pending',
        };

        // Estimate tokens: rough heuristic — 1 token ≈ 4 chars
        $inputTokens = (int) ceil(mb_strlen($chat->body) / 4);
        $responseTokens = $chat->response_message ? (int) ceil(mb_strlen($chat->response_message) / 4) : 0;
        $estimatedTokens = $inputTokens + $responseTokens;

        return [
            'id' => $chat->id,
            'message_id' => $chat->message_id,
            'client_phone' => $chat->client_phone ?? $chat->from,
            'profile_name' => $chat->profile_name ?? 'Tidak Dikenal',
            'body_snippet' => mb_substr($chat->body, 0, 60),
            'intent' => $intent,
            'status' => $chat->status,
            'api_status' => $apiStatus,
            'estimated_tokens' => $estimatedTokens,
            'response_snippet' => $chat->response_message ? mb_substr($chat->response_message, 0, 80) : null,
            'created_at' => $chat->created_at?->toIso8601String(),
            'created_at_human' => $chat->created_at?->diffForHumans(),
        ];
    }

    private function detectIntent(string $body): string
    {
        $body = mb_strtolower($body);

        $intentMap = [
            'tanya_produk' => ['produk', 'harga', 'berapa', 'jual', 'ada gak', 'tersedia', 'stock', 'stok', 'info'],
            'komplain' => ['komplain', 'kecewa', 'rusak', 'tidak berfungsi', 'jelek', 'buruk', 'refund', 'kembalikan', 'masalah'],
            'minat_beli' => ['beli', 'pesan', 'order', 'mau', 'minta', 'butuh', 'perlu', 'ngerti'],
            'tanya_pengiriman' => ['kirim', 'ongkir', 'pengiriman', 'tiba', 'sampai', 'ekspedisi', 'resi'],
            'salam' => ['halo', 'hai', 'hello', 'hi', 'selamat', 'pagi', 'siang', 'malam', 'apa kabar'],
            'follow_up' => ['sudah', 'gimana', 'bagaimana', 'update', 'lanjut', 'kapan'],
        ];

        foreach ($intentMap as $intent => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($body, $keyword)) {
                    return $intent;
                }
            }
        }

        return 'lainnya';
    }
}
