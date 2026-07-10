<?php

namespace App\Http\Controllers\Whatsapp;

use App\Http\Controllers\Controller;
use App\Services\SalesAssistService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SalesAssistController extends Controller
{
    public function __construct(protected SalesAssistService $salesAssist) {}

    public function analyze(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'transcript' => ['required', 'string'],
            'conversation_id' => ['nullable', 'string'],
            'user_id' => ['nullable'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $transcript = $request->input('transcript');
        $conversationId = $request->input('conversation_id');
        $userId = $request->input('user_id', 1);

        $result = $this->salesAssist->analyze(
            conversationId: $conversationId,
            transcript: $transcript,
            userId: $userId
        );

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'recommendations' => $result['recommendations'],
            'conversation_id' => $result['conversation_id'],
        ]);
    }
}
