<?php

namespace App\Http\Controllers\Whatsapp;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ShortLink;
use App\Services\TrackService;
use Illuminate\Http\Request;

class ShortLinkController extends Controller
{
    public function __construct(protected TrackService $trackService) {}

    public function redirect(Request $request, string $code)
    {
        $short = ShortLink::where('code', $code)->first();

        $product = Product::where('slug', $short->product_slug)->first();

        $this->trackService->generateRef(
            $request,
            $product,
            $short->code,
            $short->conversation_id,
            $short->agent_phone,
            $short->client_phone,
            $short->profile_name
        );

        return redirect($product->link);
    }
}
