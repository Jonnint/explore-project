<?php

namespace App\Services;

use App\Models\LinkClick;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    public function getProductPerformance(?string $search = null, ?string $category = null, bool $withTrends = false): LengthAwarePaginator
    {
        $conversionOrder = '(SELECT COUNT(*) FROM orders WHERE orders.product_id = products.id)
            / NULLIF((SELECT COUNT(*) FROM link_clicks WHERE link_clicks.product_id = products.id
            AND link_clicks.clicked_at IS NOT NULL), 0) DESC';

        $products = Product::with('category')
            ->withCount([
                'linkClicks as total_clicks' => fn ($q) => $q->whereNotNull('clicked_at'),
                'orders as total_orders',
            ])
            ->withSum('orders', 'total_price')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            }))
            ->when($category, fn ($q) => $q->whereHas('category', fn ($q) => $q->where('slug', $category)))
            ->orderByRaw($conversionOrder)
            ->paginate(5)
            ->withQueryString();

        $productIds = $products->pluck('id');
        $days = collect(range(6, 0))->map(fn ($i) => now()->subDays($i)->toDateString());
        $dateRange = [now()->subDays(6)->startOfDay(), now()->endOfDay()];

        if ($withTrends) {
            $allClicks = LinkClick::whereIn('product_id', $productIds)
                ->whereNotNull('clicked_at')
                ->whereBetween('clicked_at', $dateRange)
                ->selectRaw('product_id, DATE(clicked_at) as date, COUNT(*) as total')
                ->groupBy('product_id', 'date')
                ->get()
                ->groupBy('product_id');

            $allOrders = Order::whereIn('product_id', $productIds)
                ->whereBetween('ordered_at', $dateRange)
                ->selectRaw('product_id, DATE(ordered_at) as date, COUNT(*) as total')
                ->groupBy('product_id', 'date')
                ->get()
                ->groupBy('product_id');
        }

        $products->through(fn ($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'category' => $product->category?->name,
            'clicks' => $product->total_clicks,
            'orders' => $product->total_orders,
            'conversion' => $product->total_clicks > 0
                ? round(($product->total_orders / $product->total_clicks) * 100, 1)
                : 0,
            'revenue' => $product->orders_sum_total_price ?? 0,
            'status' => $this->resolveProductStatus($product->total_orders),
            ...($withTrends ? ['trends' => $days->map(fn ($date) => [
                'date' => $date,
                'clicks' => $allClicks->get($product->id)?->firstWhere('date', $date)?->total ?? 0,
                'orders' => $allOrders->get($product->id)?->firstWhere('date', $date)?->total ?? 0,
            ])->values()->toArray()] : []),
        ]);

        return $products;
    }

    public function getProductStats(): array
    {
        $now = now();
        $startThisMonth = $now->copy()->startOfMonth();
        $startLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endLastMonth = $now->copy()->subMonth()->endOfMonth();

        $revenueThis = Order::whereBetween('ordered_at', [$startThisMonth, $now])->sum('total_price');
        $revenueLast = Order::whereBetween('ordered_at', [$startLastMonth, $endLastMonth])->sum('total_price');

        $clicksThis = LinkClick::whereBetween('clicked_at', [$startThisMonth, $now])->whereNotNull('clicked_at')->count();
        $clicksLast = LinkClick::whereBetween('clicked_at', [$startLastMonth, $endLastMonth])->whereNotNull('clicked_at')->count();

        $ordersThis = Order::whereBetween('ordered_at', [$startThisMonth, $now])->count();
        $ordersLast = Order::whereBetween('ordered_at', [$startLastMonth, $endLastMonth])->count();

        $avgThis = $ordersThis > 0 ? round($revenueThis / $ordersThis) : 0;
        $avgLast = $ordersLast > 0 ? round($revenueLast / $ordersLast) : 0;

        return [
            'total_revenue' => [
                'value' => $revenueThis,
                'change' => $this->percentageChange($revenueLast, $revenueThis),
            ],
            'total_clicks' => [
                'value' => $clicksThis,
                'change' => $this->percentageChange($clicksLast, $clicksThis),
            ],
            'conversions' => [
                'value' => $ordersThis,
                'rate' => $clicksThis > 0 ? round(($ordersThis / $clicksThis) * 100, 1) : 0,
                'change' => $this->percentageChange($ordersLast, $ordersThis),
            ],
            'avg_order_value' => [
                'value' => $avgThis,
                'change' => $this->percentageChange($avgLast, $avgThis),
            ],
        ];
    }

    private function percentageChange(float $old, float $new): float
    {
        if ($old == 0) {
            return $new > 0 ? 100 : 0;
        }

        return round((($new - $old) / $old) * 100, 1);
    }

    private function resolveProductStatus(int $totalOrders): string
    {
        return match (true) {
            $totalOrders >= 100 => 'Hot',
            $totalOrders >= 50 => 'Growing',
            default => 'Stable',
        };
    }
}
