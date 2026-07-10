<?php

namespace App\Services;

use App\Models\LinkClick;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class TrackService
{
    public function generateRef(
        Request $request,
        Product $product,
        string $code,
        ?string $conversationId,
        string $agentPhone,
        string $clientPhone,
        string $profileName
    ) {
        $user = User::where('phone', $agentPhone)->first();

        $track = LinkClick::create([
            'track_code' => $code,
            'product_id' => $product->id,
            'conversation_id' => $conversationId,
            'original_url' => $product->link,
            'clicked_at' => now(),
            'ip_address' => $request->ip(),
            'browser_agent' => $request->userAgent(),
            'agent_phone' => $agentPhone,
            'client_phone' => $clientPhone,
            'user_id' => $user ? $user->id : null,
            'profile_name' => $profileName,
        ]);

        return $track;
    }

    public function redirect(Request $request)
    {
        $ref = $request->ref;

        $click = LinkClick::where('track_code', $ref)->firstOrFail();

        if (! $click->clicked_at) {
            $click->update([
                'clicked_at' => now(),
                'ip_address' => request()->ip(),
            ]);
        }

        return redirect($click->original_url);
    }
}
