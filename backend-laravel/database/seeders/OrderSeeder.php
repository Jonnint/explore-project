<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();

        $orders = [
            [
                'product_id' => $products->where('slug', 'smartwatch-fitness-tracker')->first()->id,
                'quantity' => 1,
                'conversation_id' => 'WA-001',
                'agent_phone' => '6281212340001',
                'client_phone' => '6281398760001',
                'profile_name' => 'Siti Rahmawati',
                'status' => 'delivered',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'kaos-oversize-unisex')->first()->id,
                'quantity' => 2,
                'conversation_id' => 'WA-001',
                'agent_phone' => '6281212340001',
                'client_phone' => '6281398760001',
                'profile_name' => 'Siti Rahmawati',
                'status' => 'delivered',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'vitamin-c-1000mg')->first()->id,
                'quantity' => 3,
                'conversation_id' => 'WA-002',
                'agent_phone' => '6281212340002',
                'client_phone' => '6285678900002',
                'profile_name' => 'Ahmad Fauzi',
                'status' => 'confirmed',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'kopi-arabika-gayo')->first()->id,
                'quantity' => 1,
                'conversation_id' => 'WA-003',
                'agent_phone' => '6281212340003',
                'client_phone' => '6282123450003',
                'profile_name' => 'Dewi Lestari',
                'status' => 'shipped',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'matras-yoga-anti-slip')->first()->id,
                'quantity' => 1,
                'conversation_id' => 'WA-003',
                'agent_phone' => '6281212340003',
                'client_phone' => '6282123450003',
                'profile_name' => 'Dewi Lestari',
                'status' => 'shipped',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'power-bank-10000mah')->first()->id,
                'quantity' => 1,
                'conversation_id' => 'WA-004',
                'agent_phone' => '6281212340004',
                'client_phone' => '6287887650004',
                'profile_name' => 'Budi Santoso',
                'status' => 'pending',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'protein-bar-coklat')->first()->id,
                'quantity' => 5,
                'conversation_id' => 'WA-005',
                'agent_phone' => '6281212340005',
                'client_phone' => '6281345670005',
                'profile_name' => 'Rina Wijaya',
                'status' => 'confirmed',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'dumbbell-5kg-pasang')->first()->id,
                'quantity' => 1,
                'conversation_id' => 'WA-006',
                'agent_phone' => '6281212340006',
                'client_phone' => '6281987650006',
                'profile_name' => 'Hendra Gunawan',
                'status' => 'cancelled',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'earphone-bluetooth-tws')->first()->id,
                'quantity' => 1,
                'conversation_id' => 'WA-007',
                'agent_phone' => '6281212340007',
                'client_phone' => '6285654320007',
                'profile_name' => 'Putri Ayu',
                'status' => 'delivered',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
            [
                'product_id' => $products->where('slug', 'madu-hutan-asli')->first()->id,
                'quantity' => 2,
                'conversation_id' => 'WA-007',
                'agent_phone' => '6281212340007',
                'client_phone' => '6285654320007',
                'profile_name' => 'Putri Ayu',
                'status' => 'delivered',
                'ordered_at' => now()->subDays(rand(0, 29))->toDateTimeString(),
            ],
        ];

        foreach ($orders as $order) {
            $order['total_price'] = Product::find($order['product_id'])->price * $order['quantity'];
            Order::create($order);
        }
    }
}
