<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendingChat;
use App\Services\WhatsAppServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManualWhatsAppMessageController extends Controller
{
    public function __construct(private WhatsAppServices $whatsAppServices) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to' => ['required', 'string', 'max:32'],
            'body' => ['required', 'string', 'max:4096'],
        ]);

        $agentPhone = $request->user()->phone;

        if (empty($agentPhone)) {
            return response()->json([
                'success' => false,
                'message' => 'Authenticated user does not have a phone number.',
            ], 422);
        }

        if (empty(config('services.whatsapp.token'))) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp token is not configured.',
            ], 422);
        }

        $phoneId = PendingChat::where('agent_phone', $agentPhone)
            ->whereNotNull('phone_id')
            ->latest()
            ->value('phone_id');

        if (empty($phoneId)) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp phone ID was not found for this agent.',
            ], 422);
        }

        $result = $this->whatsAppServices->sendManualTextMessage(
            phoneId: $phoneId,
            to: $validated['to'],
            body: $validated['body'],
        );

        if (! $result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'data' => $result['data'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully.',
            'data' => $result['data'],
        ]);
    }
}
