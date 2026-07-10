<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WhatsAppServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WhatsAppTemplateController extends Controller
{
    public function __construct(private WhatsAppServices $whatsAppServices) {}

    public function index(): JsonResponse
    {
        if ($response = $this->missingTemplateConfigResponse()) {
            return $response;
        }

        return $this->respond($this->whatsAppServices->listMessageTemplates());
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->missingTemplateConfigResponse()) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:512', 'regex:/^[a-z0-9_]+$/'],
            'language' => ['required', 'string', 'max:16'],
            'category' => ['required', 'string', 'max:64'],
            'body' => ['required', 'string', 'max:1024'],
            'body_params' => ['nullable', 'array'],
            'body_params.*.param_name' => ['required_with:body_params', 'string', 'max:128'],
            'body_params.*.example' => ['required_with:body_params', 'string', 'max:256'],
            'footer' => ['nullable', 'string', 'max:60'],
            'buttons' => ['nullable', 'array', 'max:10'],
            'buttons.*.type' => ['required_with:buttons', Rule::in(['quick_reply', 'url', 'phone_number'])],
            'buttons.*.text' => ['required_with:buttons', 'string', 'max:25'],
            'buttons.*.url' => ['nullable', 'string', 'max:2048'],
            'buttons.*.phone_number' => ['nullable', 'string', 'max:32'],
        ]);

        $this->validateButtonRequirements($validated['buttons'] ?? []);

        return $this->respond($this->whatsAppServices->createMessageTemplate($validated));
    }

    public function show(string $template): JsonResponse
    {
        if ($response = $this->missingTemplateConfigResponse()) {
            return $response;
        }

        return $this->respond($this->whatsAppServices->getMessageTemplate($template));
    }

    public function destroy(string $template): JsonResponse
    {
        if ($response = $this->missingTemplateConfigResponse()) {
            return $response;
        }

        return $this->respond($this->whatsAppServices->deleteMessageTemplate($template));
    }

    private function missingTemplateConfigResponse(): ?JsonResponse
    {
        if (empty(config('services.whatsapp.token'))) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp token is not configured.',
                'data' => null,
            ], 422);
        }

        if (empty(config('services.whatsapp.business_account_id'))) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp business account ID is not configured.',
                'data' => null,
            ], 422);
        }

        return null;
    }

    /**
     * @param  array<int, array<string, mixed>>  $buttons
     */
    private function validateButtonRequirements(array $buttons): void
    {
        $errors = [];

        foreach ($buttons as $index => $button) {
            if (($button['type'] ?? null) === 'url' && empty($button['url'])) {
                $errors["buttons.{$index}.url"] = ['The url field is required for URL buttons.'];
            }

            if (($button['type'] ?? null) === 'phone_number' && empty($button['phone_number'])) {
                $errors["buttons.{$index}.phone_number"] = ['The phone number field is required for phone number buttons.'];
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * @param  array{success: bool, message: string, status: int, data: array<string, mixed>|null}  $result
     */
    private function respond(array $result): JsonResponse
    {
        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'data' => $result['data'],
        ], $result['status']);
    }
}
