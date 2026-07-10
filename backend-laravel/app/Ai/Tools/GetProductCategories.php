<?php

namespace App\Ai\Tools;

use App\Models\Category;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetProductCategories implements Tool
{
    public function description(): Stringable|string
    {
        return 'Ambil semua kategori produk yang tersedia beserta slug-nya. HANYA boleh dipanggil jika customer mencari/menanyakan produk atau kategori produk secara spesifik. DILARANG KERAS memanggil tool ini jika customer hanya menyapa (seperti "halo", "hi", "pagi", dll) atau bertanya hal umum.';
    }

    public function handle(Request $request): Stringable|string
    {
        $categories = Category::latest()->get();

        if ($categories->isEmpty()) {
            return 'Tidak ada kategori yang tersedia.';
        }

        return $categories->map(function ($category) {
            return [
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ];
        })->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
