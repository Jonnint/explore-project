<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendingChat;
use App\Services\WhatsAppServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppTemplateMessageController extends Controller
{
    public function __construct(private WhatsAppServices $whatsAppServices) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to' => ['required', 'string', 'max:32'],
            'template_name' => ['required', 'string', 'max:512'],
            'language' => ['required', 'string', 'max:16'],
            'body_params' => ['nullable', 'array'],
            'body_params.*.parameter_name' => ['required_with:body_params', 'string', 'max:128'],
            'body_params.*.text' => ['required_with:body_params', 'string', 'max:1024'],
        ]);

        if (empty(config('services.whatsapp.token'))) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp token is not configured.',
                'data' => null,
            ], 422);
        }

        $phoneId = $this->resolvePhoneId($request);

        if (empty($phoneId)) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp phone ID is not configured.',
                'data' => null,
            ], 422);
        }

        $result = $this->whatsAppServices->sendTemplateMessage(
            phoneId: $phoneId,
            to: $validated['to'],
            templateName: $validated['template_name'],
            language: $validated['language'],
            bodyParams: $validated['body_params'] ?? [],
        );

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => $result['data'],
        ], $result['status']);
    }

    private function resolvePhoneId(Request $request): ?string
    {
        $configuredPhoneId = config('services.whatsapp.phone_id');

        if (! empty($configuredPhoneId)) {
            return $configuredPhoneId;
        }

        $agentPhone = $request->user()->phone;

        if (empty($agentPhone)) {
            return null;
        }

        return PendingChat::where('agent_phone', $agentPhone)
            ->whereNotNull('phone_id')
            ->latest()
            ->value('phone_id');
    }
}
