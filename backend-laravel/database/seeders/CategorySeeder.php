<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Elektronik',
                'description' => 'Kategori yang mencakup perangkat elektronik, gadget, dan aksesori perangkat digital.',
            ],
            [
                'name' => 'Fashion',
                'description' => 'Kategori yang mencakup pakaian, alas kaki, dan aksesori busana untuk pria maupun wanita.',
            ],
            [
                'name' => 'Makanan',
                'description' => 'Kategori yang mencakup makanan dan camilan untuk konsumsi sehari-hari.',
            ],
            [
                'name' => 'Minuman',
                'description' => 'Kategori yang mencakup berbagai minuman untuk mendukung hidrasi dan kesehatan.',
            ],
            [
                'name' => 'Kesehatan',
                'description' => 'Kategori yang mencakup suplemen dan vitamin untuk menjaga kesehatan dan daya tahan tubuh.',
            ],
            [
                'name' => 'Olahraga',
                'description' => 'Kategori yang mencakup peralatan dan perlengkapan olahraga.',
            ],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'is_active' => true,
            ]);
        }
    }
}
