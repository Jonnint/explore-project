<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LinkClick;
use App\Models\ShortLink;
use Illuminate\Support\Facades\Auth;

class AgentLinkController extends Controller
{
    public function index()
    {
        $links = ShortLink::select('short_links.*')
            ->where('agent_phone', Auth::user()->phone)
            ->addSelect([
                'click_count' => LinkClick::selectRaw('count(*)')
                    ->whereColumn('track_code', 'short_links.code')
                    ->whereColumn('conversation_id', 'short_links.conversation_id'),
            ])
            ->latest()
            ->paginate(20);

        return response()->json($links);
    }

    public function show(string $code)
    {
        $link = ShortLink::where('code', $code)
            ->where('agent_phone', Auth::user()->phone)
            ->first();

        if (! $link) {
            return response()->json(['error' => 'Link not found'], 404);
        }

        $clicks = LinkClick::where('track_code', $code)
            ->with('product')
            ->get();

        return response()->json([
            'link' => $link,
            'clicks' => $clicks,
        ]);
    }

    public function stats()
    {
        $agentPhone = Auth::user()->phone;

        $totalClicks = LinkClick::where('agent_phone', $agentPhone)->count();

        $topProducts = LinkClick::where('agent_phone', $agentPhone)
            ->with('product')
            ->selectRaw('product_id, count(*) as click_count')
            ->groupBy('product_id')
            ->orderByDesc('click_count')
            ->limit(5)
            ->get();

        return response()->json([
            'total_clicks' => $totalClicks,
            'top_products' => $topProducts,
        ]);
    }
}
