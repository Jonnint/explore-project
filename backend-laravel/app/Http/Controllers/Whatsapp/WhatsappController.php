<?php

namespace App\Http\Controllers\Whatsapp;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPendingChatsJob;
use App\Models\Lead;
use App\Models\PendingChat;
use App\Services\WhatsAppServices;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    public function __construct(protected WhatsAppServices $wa) {}

    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === config('services.whatsapp.verify_token')) {
            return response($challenge, 200);
        }

        return response('Forbidden', 403);
    }

    public function receive(Request $request)
    {
        $data = $request->all();
        Log::debug('WhatsApp webhook received', $data);

        $entry = $data['entry'][0] ?? null;
        $changes = $entry['changes'][0]['value'] ?? null;
        $message = $changes['messages'][0] ?? null;
        $status = $changes['statuses'][0] ?? null;

        $agentPhone = $changes['metadata']['display_phone_number'] ?? null;
        $phoneId = $changes['metadata']['phone_number_id'] ?? null;
        $profileName = $changes['contacts'][0]['profile']['name'] ?? null;
        $clientPhone = $changes['contacts'][0]['wa_id'] ?? null;

        if ($status) {
            $error = $status['errors'][0] ?? [];

            Log::warning('WhatsApp message status update', [
                'message_id' => $status['id'] ?? null,
                'status' => $status['status'] ?? null,
                'recipient_id' => $status['recipient_id'] ?? null,
                'phone_id' => $phoneId,
                'error_code' => $error['code'] ?? null,
                'error_title' => $error['title'] ?? null,
                'error_message' => $error['message'] ?? null,
                'error_details' => $error['error_data']['details'] ?? null,
            ]);

            return response()->json(['status' => 'OK'], 200);
        }

        if ($message && $message['type'] === 'text') {
            $messageId = $message['id'];
            $from = $message['from'];
            $body = $message['text']['body'];

            $alreadyProcessed = PendingChat::where('message_id', $messageId)->exists()
                || Lead::where('phone_number', $from)
                    ->where(function ($query) use ($messageId) {
                        DB::connection()->getDriverName() === 'pgsql'
                            ? $query->whereRaw('messages::text LIKE ?', ["%{$messageId}%"])
                            : $query->where('messages', 'like', "%{$messageId}%");
                    })
                    ->exists();

            if ($alreadyProcessed) {
                return response()->json(['status' => 'duplicate'], 200);
            }

            $pendingChat = PendingChat::create([
                'message_id' => $messageId,
                'from' => $from,
                'body' => $body,
                'agent_phone' => $agentPhone,
                'phone_id' => $phoneId,
                'client_phone' => $clientPhone,
                'profile_name' => $profileName,
                'status' => 'pending',
            ]);

            $this->wa->setPhoneId($phoneId)->sendTypingOn($messageId);

            Log::info('Dispatching ProcessPendingChatsJob with base URL: '.config('app.url'));

            // Dispatch background queue job to process pending chats
            ProcessPendingChatsJob::dispatch(config('app.url'));

            return response()->json(['status' => 'OK', 'result' => 'Queued'], 200);
        }

        return response()->json(['status' => 'OK'], 200);
    }

    public function testConnection()
    {
        $status = $this->wa->testConnection();

        if ($status['success']) {
            return response()->json([
                'success' => true,
                'message' => $status['message'],
                'data' => $status['data'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $status['message'],
        ], 400);
    }
}
