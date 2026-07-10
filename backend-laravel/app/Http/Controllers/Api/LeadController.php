<?php

namespace App\Http\Controllers\Api;

use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Services\LeadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeadController extends Controller
{
    public function __construct(private LeadService $leadService) {}

    public function index(Request $request)
    {
        $agentPhone = Auth::user()->phone;
        $status = $request->query('status');

        $leads = $this->leadService->getLeadsWithConversations($agentPhone, $status ? LeadStatus::tryFrom($status) : null);

        return response()->json([
            'leads' => $leads,
        ]);
    }

    public function show(Request $request, $id)
    {
        $agentPhone = Auth::user()->phone;
        $nocache = $request->has('nocache') || $request->has('refresh');
        $lead = $this->leadService->getLeadWithMessages((int) $id, $agentPhone, $nocache);

        if (! $lead) {
            return response()->json(['error' => 'Lead not found'], 404);
        }

        return response()->json([
            'lead' => $lead,
        ]);
    }

    public function updateLastMessage($id)
    {
        $agentPhone = Auth::user()->phone;
        $lead = Lead::where('id', $id)->where('agent_phone', $agentPhone)->first();

        if (! $lead) {
            return response()->json(['error' => 'Lead not found'], 404);
        }

        $this->leadService->updateLastMessageTime($lead);

        return response()->json([
            'message' => 'Lead updated successfully',
            'lead' => [
                'id' => $lead->id,
                'status' => $lead->status,
                'last_message_at' => $lead->last_message_at?->toIso8601String(),
            ],
        ]);
    }

    public function getStats()
    {
        $agentPhone = Auth::user()->phone;
        $stats = $this->leadService->getLeadStats($agentPhone);

        return response()->json([
            'stats' => $stats,
        ]);
    }
}
