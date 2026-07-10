<?php

namespace App\Services;

use App\Ai\Agents\DashboardInsightAgent;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\LinkClick;
use App\Models\Order;
use App\Models\PendingChat;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Responses\StructuredAgentResponse;
use Throwable;

class DashboardService
{
    public function getSummary(): array
    {
        $now = Carbon::now();
        $startThisMonth = $now->copy()->startOfMonth();
        $startLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endLastMonth = $now->copy()->subMonth()->endOfMonth();

        $revenueThisMonth = Order::whereBetween('ordered_at', [$startThisMonth, $now])->sum('total_price');
        $revenueLastMonth = Order::whereBetween('ordered_at', [$startLastMonth, $endLastMonth])->sum('total_price');

        $ordersThisMonth = Order::whereBetween('ordered_at', [$startThisMonth, $now])->count();
        $ordersLastMonth = Order::whereBetween('ordered_at', [$startLastMonth, $endLastMonth])->count();

        $clicksThisMonth = LinkClick::whereBetween('clicked_at', [$startThisMonth, $now])->count();
        $clicksLastMonth = LinkClick::whereBetween('clicked_at', [$startLastMonth, $endLastMonth])->count();

        $conversionThisMonth = $clicksThisMonth > 0 ? round(($ordersThisMonth / $clicksThisMonth) * 100, 1) : 0;
        $conversionLastMonth = $clicksLastMonth > 0 ? round(($ordersLastMonth / $clicksLastMonth) * 100, 1) : 0;

        $activeLeadsToday = Lead::whereDate('last_message_at', today())->count();
        $activeLeadsYesterday = Lead::whereDate('last_message_at', today()->subDay())->count();

        return [
            'revenue' => [
                'value' => $revenueThisMonth,
                'change' => $this->percentageChange($revenueLastMonth, $revenueThisMonth),
            ],
            'conversion' => [
                'value' => $conversionThisMonth,
                'change' => $this->percentageChange($conversionLastMonth, $conversionThisMonth),
            ],
            'active_leads' => [
                'value' => $activeLeadsToday,
                'change' => $this->percentageChange($activeLeadsYesterday, $activeLeadsToday),
            ],
        ];
    }

    public function getSalesTrend(int $months = 12): array
    {
        $months = collect(range($months - 1, 0))->map(fn ($i) => now()->subMonths($i));

        $driver = DB::connection()->getDriverName();
        $selectRaw = match ($driver) {
            'sqlite' => "strftime('%Y', ordered_at) as year, strftime('%m', ordered_at) as month, SUM(total_price) as total",
            'pgsql' => 'EXTRACT(YEAR FROM ordered_at) as year, EXTRACT(MONTH FROM ordered_at) as month, SUM(total_price) as total',
            default => 'YEAR(ordered_at) as year, MONTH(ordered_at) as month, SUM(total_price) as total',
        };

        $revenue = Order::whereBetween('ordered_at', [
            now()->subMonths($months->count() - 1)->startOfMonth(),
            now()->endOfMonth(),
        ])
            ->selectRaw($selectRaw)
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn ($item) => $item->year.'-'.str_pad($item->month, 2, '0', STR_PAD_LEFT));

        return $months->map(fn ($date) => [
            'month' => $date->format('M'),
            'year' => $date->format('Y'),
            'revenue' => $revenue[$date->format('Y-m')]->total ?? 0,
        ])->values()->toArray();
    }

    public function getTopConvertingProducts(int $limit = 5): array
    {
        return Product::has('orders')
            ->withCount('orders')
            ->withSum('orders', 'total_price')
            ->orderByDesc('orders_count')
            ->limit($limit)
            ->get()
            ->map(fn ($product) => [
                'name' => $product->name,
                'revenue' => $product->orders_sum_total_price ?? 0,
            ])
            ->toArray();
    }

    public function getPriorityLeads(int $limit = 5): array
    {
        return Lead::where('status', LeadStatus::Hot->value)
            ->orWhere('status', LeadStatus::Warm->value)
            ->orderByDesc('last_message_at')
            ->limit($limit)
            ->get()
            ->map(fn ($lead) => [
                'name' => $lead->name,
                'phone' => $lead->phone,
                'product' => $lead->product,
                'status' => $lead->status,
                'last_message_at' => $lead->last_message_at?->diffForHumans(),
            ])
            ->toArray();
    }

    public function getInsights(array $data, bool $forceRefresh = false): array
    {
        $cacheKey = 'dashboard_insights_'.auth()->id();

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($data) {
            try {
                $simplifiedData = [
                    'summary' => $data['summary'] ?? [],
                    'lead_stats' => $data['lead_stats'] ?? [],
                    'priority_leads_count' => count($data['priority_leads'] ?? []),
                    'top_products' => collect($data['top_converting'] ?? [])->take(3)->toArray(),
                    'recent_products' => collect($data['products']['data'] ?? [])->take(3)->map(function ($p) {
                        return [
                            'name' => $p['name'] ?? '',
                            'category' => $p['category'] ?? '',
                            'clicks' => $p['clicks'] ?? 0,
                            'orders' => $p['orders'] ?? 0,
                            'conversion' => $p['conversion'] ?? 0,
                        ];
                    })->toArray(),
                ];

                $agent = new DashboardInsightAgent;
                $prompt = "Berikut adalah ringkasan data dashboard penjualan saat ini:\n".
                    json_encode($simplifiedData, JSON_PRETTY_PRINT).
                    "\n\nAnalisislah data tersebut dan berikan 4 insight sesuai dengan instruksi.";

                $response = $agent->prompt($prompt);

                /** @var StructuredAgentResponse $response */
                if (isset($response['insights']) && is_array($response['insights']) && count($response['insights']) === 4) {
                    return $response['insights'];
                }
            } catch (Throwable $e) {
                Log::error('Failed to generate dashboard insights via AI', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }

            // Fallback dynamic insights
            $topProduct = $data['top_converting'][0]['name'] ?? ($data['products']['data'][0]['name'] ?? 'produk unggulan');
            $hotLeadsCount = $data['lead_stats']['hot'] ?? 0;

            return [
                [
                    'title' => 'Waktu Konversi Optimal',
                    'description' => "Pelanggan yang tertarik {$topProduct} merespon lebih baik dengan follow-up edukatif dalam 2 jam.",
                    'action_text' => 'Lihat Strategi',
                    'action_type' => 'strategy',
                ],
                [
                    'title' => 'Lonjakan Permintaan Produk',
                    'description' => "Permintaan {$topProduct} meningkat minggu ini. Pertimbangkan promosi bundle imunitas.",
                    'action_text' => 'Lihat Produk',
                    'action_type' => 'product',
                ],
                [
                    'title' => 'Peringatan Hot Lead',
                    'description' => "{$hotLeadsCount} lead menunjukkan niat beli tinggi hari ini. Prioritaskan follow-up untuk konversi maksimal.",
                    'action_text' => 'Lihat Lead',
                    'action_type' => 'lead',
                ],
                [
                    'title' => 'Pola Konversi',
                    'description' => "Pendekatan edukatif meningkatkan penjualan {$topProduct}. Terus gunakan strategi ini.",
                    'action_text' => 'Pelajari Lebih Lanjut',
                    'action_type' => 'pattern',
                ],
            ];
        });
    }

    private function percentageChange(float $old, float $new): float
    {
        if ($old == 0) {
            return $new > 0 ? 100 : 0;
        }

        return round((($new - $old) / $old) * 100, 1);
    }

    public function getActiveCustomerHours(string $agentPhone): array
    {
        $chartData = collect(range(0, 23))->mapWithKeys(function ($hour) {
            $formattedHour = str_pad($hour, 2, '0', STR_PAD_LEFT).':00';

            return [
                $formattedHour => [
                    'hour' => $formattedHour,
                    'total' => 0,
                ],
            ];
        })->all();

        $driver = DB::connection()->getDriverName();
        $selectRaw = match ($driver) {
            'sqlite' => "strftime('%H:00', created_at) as hour_key, count(message_id) as total",
            'pgsql' => "TO_CHAR(created_at, 'HH24:00') as hour_key, count(message_id) as total",
            default => "DATE_FORMAT(created_at, '%H:00') as hour_key, count(message_id) as total",
        };

        $activities = PendingChat::where('agent_phone', $agentPhone)
            ->selectRaw($selectRaw)
            ->groupBy('hour_key')
            ->get();

        foreach ($activities as $activity) {
            if (isset($chartData[$activity->hour_key])) {
                $chartData[$activity->hour_key]['total'] = (int) $activity->total;
            }
        }

        return array_values($chartData);
    }
}
