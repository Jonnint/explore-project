<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\LinkClick;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LinkClickController extends Controller
{
    public function index(Request $request)
    {
        $query = LinkClick::with('product')
            ->latest();

        // Filter per produk
        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        $clicks = $query->paginate(20);

        // Statistik keseluruhan
        $stats = [
            'total_clicks' => LinkClick::count(),
            'clicked' => LinkClick::whereNotNull('clicked_at')->count(),
            'pending' => LinkClick::whereNull('clicked_at')->count(),
            'top_products' => Product::withCount(['linkClicks as total_clicks'])
                ->having('total_clicks', '>', 0)
                ->orderByDesc('total_clicks')
                ->take(10)
                ->get(),
        ];

        return Inertia::render('admin/link-clicks/index', [
            'clicks' => $clicks,
            'stats' => $stats,
            'filters' => $request->only(['product_id']),
            'products' => Product::select('id', 'name')->get(),
        ]);
    }

    public function indexApi(Request $request)
    {
        $user = Auth::user();

        $productQuery = Product::with([
            'category:id,name,slug',
            'linkClicks' => fn ($q) => $q->where('user_id', $user->id),
        ])->withCount([
            'linkClicks as total_links_generated' => fn ($q) => $q->where('user_id', $user->id),
        ])->orderByDesc('total_links_generated');

        if ($request->filled('category')) {
            $productQuery->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        $products = $productQuery->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'price' => $p->price,
            'category_id' => $p->category_id,
            'total_links_generated' => $p->total_links_generated,
            'total_recommendations' => $p->recommendation_count,
            'links' => $p->linkClicks,
        ]);

        $stats = [
            'total_links_generated' => LinkClick::where('user_id', $user->id)->count(),
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
        ];

        $categories = Category::select('id', 'name', 'slug')->get();

        return response()->json([
            'stats' => $stats,
            'categories' => $categories,
            'products' => $products,
        ]);
    }
}
