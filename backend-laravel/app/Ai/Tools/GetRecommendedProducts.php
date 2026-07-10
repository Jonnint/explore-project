<?php

namespace App\Ai\Tools;

use App\Models\Product;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetRecommendedProducts implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Ambil daftar produk dari database berdasarkan slug kategori. HANYA boleh dipanggil jika customer mencari/menanyakan rekomendasi produk secara spesifik. DILARANG KERAS memanggil tool ini jika customer hanya menyapa (seperti "halo", "hi", "pagi", dll) atau bertanya hal umum.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $query = Product::query();

        if (! empty($request['category'])) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request['category']);
            });
        }

        $products = $query->limit(5)->get();

        if ($products->isEmpty()) {
            return json_encode(['products' => [], 'message' => 'Tidak ada produk ditemukan.']);
        }

        return $products->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'price' => $p->price,
            'description' => $p->description,
            'link' => $p->link,
        ])->toJson(JSON_UNESCAPED_UNICODE);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'category' => $schema->string()
                ->description('Slug kategori untuk filter produk. Kosongkan jika ingin semua produk.'),
        ];
    }
}
