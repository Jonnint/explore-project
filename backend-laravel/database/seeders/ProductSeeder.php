<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $elektronik = Category::where('slug', 'elektronik')->first()->id;
        $fashion = Category::where('slug', 'fashion')->first()->id;
        $makanan = Category::where('slug', 'makanan')->first()->id;
        $minuman = Category::where('slug', 'minuman')->first()->id;
        $kesehatan = Category::where('slug', 'kesehatan')->first()->id;
        $olahraga = Category::where('slug', 'olahraga')->first()->id;

        $products = [

            // ── Elektronik ────────────────────────────────────────────
            [
                'category_id' => $elektronik,
                'name' => 'Earphone Bluetooth TWS',
                'slug' => 'earphone-bluetooth-tws',
                'link' => 'https://example.com/products/earphone-bluetooth-tws',
                'description' => 'Earphone nirkabel dengan suara jernih dan baterai tahan lama.',
                'price' => 185000,
            ],
            [
                'category_id' => $elektronik,
                'name' => 'Smartwatch Fitness Tracker',
                'slug' => 'smartwatch-fitness-tracker',
                'link' => 'https://example.com/products/smartwatch-fitness-tracker',
                'description' => 'Jam tangan pintar dengan pemantau detak jantung dan langkah kaki.',
                'price' => 350000,
            ],
            [
                'category_id' => $elektronik,
                'name' => 'Power Bank 10000mAh',
                'slug' => 'power-bank-10000mah',
                'link' => 'https://example.com/products/power-bank-10000mah',
                'description' => 'Power bank kapasitas besar dengan pengisian cepat.',
                'price' => 220000,
            ],
            [
                'category_id' => $elektronik,
                'name' => 'USB-C Hub 7-in-1',
                'slug' => 'usb-c-hub-7-in-1',
                'link' => 'https://example.com/products/usb-c-hub-7-in-1',
                'description' => 'Hub multifungsi dengan port HDMI, USB, dan SD card.',
                'price' => 275000,
            ],
            [
                'category_id' => $elektronik,
                'name' => 'Lampu LED Smart RGB',
                'slug' => 'lampu-led-smart-rgb',
                'link' => 'https://example.com/products/lampu-led-smart-rgb',
                'description' => 'Lampu pintar yang bisa dikontrol via aplikasi dan suara.',
                'price' => 95000,
            ],

            // ── Fashion ───────────────────────────────────────────────
            [
                'category_id' => $fashion,
                'name' => 'Kaos Oversize Unisex',
                'slug' => 'kaos-oversize-unisex',
                'link' => 'https://example.com/products/kaos-oversize-unisex',
                'description' => 'Kaos oversize bahan cotton combed 30s, nyaman dipakai sehari-hari.',
                'price' => 89000,
            ],
            [
                'category_id' => $fashion,
                'name' => 'Celana Jogger Pria',
                'slug' => 'celana-jogger-pria',
                'link' => 'https://example.com/products/celana-jogger-pria',
                'description' => 'Celana jogger kasual bahan fleece lembut dan elastis.',
                'price' => 125000,
            ],
            [
                'category_id' => $fashion,
                'name' => 'Tote Bag Kanvas',
                'slug' => 'tote-bag-kanvas',
                'link' => 'https://example.com/products/tote-bag-kanvas',
                'description' => 'Tas jinjing kanvas tebal, cocok untuk kuliah dan belanja.',
                'price' => 65000,
            ],
            [
                'category_id' => $fashion,
                'name' => 'Sneakers Casual Pria',
                'slug' => 'sneakers-casual-pria',
                'link' => 'https://example.com/products/sneakers-casual-pria',
                'description' => 'Sepatu sneakers ringan dengan sol karet anti-selip.',
                'price' => 295000,
            ],
            [
                'category_id' => $fashion,
                'name' => 'Hijab Voile Polos',
                'slug' => 'hijab-voile-polos',
                'link' => 'https://example.com/products/hijab-voile-polos',
                'description' => 'Hijab segiempat bahan voile lembut dan anti-kusut.',
                'price' => 45000,
            ],

            // ── Makanan ───────────────────────────────────────────────
            [
                'category_id' => $makanan,
                'name' => 'Granola Oat Madu',
                'slug' => 'granola-oat-madu',
                'link' => 'https://example.com/products/granola-oat-madu',
                'description' => 'Granola sehat dengan campuran oat, madu, dan kacang almond.',
                'price' => 55000,
            ],
            [
                'category_id' => $makanan,
                'name' => 'Keripik Tempe Original',
                'slug' => 'keripik-tempe-original',
                'link' => 'https://example.com/products/keripik-tempe-original',
                'description' => 'Keripik tempe renyah tanpa pengawet, camilan sehari-hari.',
                'price' => 28000,
            ],
            [
                'category_id' => $makanan,
                'name' => 'Kurma Medjool Premium',
                'slug' => 'kurma-medjool-premium',
                'link' => 'https://example.com/products/kurma-medjool-premium',
                'description' => 'Kurma medjool ukuran besar, manis alami kaya serat.',
                'price' => 120000,
            ],
            [
                'category_id' => $makanan,
                'name' => 'Protein Bar Coklat',
                'slug' => 'protein-bar-coklat',
                'link' => 'https://example.com/products/protein-bar-coklat',
                'description' => 'Snack bar tinggi protein, cocok untuk camilan aktif.',
                'price' => 35000,
            ],
            [
                'category_id' => $makanan,
                'name' => 'Madu Hutan Asli',
                'slug' => 'madu-hutan-asli',
                'link' => 'https://example.com/products/madu-hutan-asli',
                'description' => 'Madu murni dari lebah hutan, tanpa campuran gula.',
                'price' => 98000,
            ],

            // ── Minuman ───────────────────────────────────────────────
            [
                'category_id' => $minuman,
                'name' => 'Teh Hijau Matcha Organik',
                'slug' => 'teh-hijau-matcha-organik',
                'link' => 'https://example.com/products/teh-hijau-matcha-organik',
                'description' => 'Bubuk matcha organik grade premium, kaya antioksidan.',
                'price' => 85000,
            ],
            [
                'category_id' => $minuman,
                'name' => 'Kopi Arabika Gayo',
                'slug' => 'kopi-arabika-gayo',
                'link' => 'https://example.com/products/kopi-arabika-gayo',
                'description' => 'Kopi arabika single origin Gayo dengan aroma buah segar.',
                'price' => 110000,
            ],
            [
                'category_id' => $minuman,
                'name' => 'Jus Buah Bit & Wortel',
                'slug' => 'jus-buah-bit-wortel',
                'link' => 'https://example.com/products/jus-buah-bit-wortel',
                'description' => 'Minuman jus sayur buah tanpa gula tambahan.',
                'price' => 32000,
            ],
            [
                'category_id' => $minuman,
                'name' => 'Aloe Vera Juice',
                'slug' => 'aloe-vera-juice',
                'link' => 'https://example.com/products/aloe-vera-juice',
                'description' => 'Minuman herbal lidah buaya untuk kesehatan pencernaan.',
                'price' => 43000,
            ],
            [
                'category_id' => $minuman,
                'name' => 'Infused Water Lemon Mint',
                'slug' => 'infused-water-lemon-mint',
                'link' => 'https://example.com/products/infused-water-lemon-mint',
                'description' => 'Air mineral infus lemon dan daun mint segar tanpa pemanis.',
                'price' => 22000,
            ],

            // ── Kesehatan ─────────────────────────────────────────────
            [
                'category_id' => $kesehatan,
                'name' => 'Vitamin C 1000mg',
                'slug' => 'vitamin-c-1000mg',
                'link' => 'https://example.com/products/vitamin-c-1000mg',
                'description' => 'Suplemen vitamin C untuk menjaga daya tahan tubuh.',
                'price' => 50000,
            ],
            [
                'category_id' => $kesehatan,
                'name' => 'Vitamin D3',
                'slug' => 'vitamin-d3',
                'link' => 'https://example.com/products/vitamin-d3',
                'description' => 'Membantu menjaga kesehatan tulang dan imun.',
                'price' => 65000,
            ],
            [
                'category_id' => $kesehatan,
                'name' => 'Omega 3 Fish Oil',
                'slug' => 'omega-3-fish-oil',
                'link' => 'https://example.com/products/omega-3-fish-oil',
                'description' => 'Baik untuk kesehatan jantung dan otak.',
                'price' => 85000,
            ],
            [
                'category_id' => $kesehatan,
                'name' => 'Zinc Plus',
                'slug' => 'zinc-plus',
                'link' => 'https://example.com/products/zinc-plus',
                'description' => 'Membantu meningkatkan sistem imun tubuh.',
                'price' => 45000,
            ],
            [
                'category_id' => $kesehatan,
                'name' => 'Magnesium Complex',
                'slug' => 'magnesium-complex',
                'link' => 'https://example.com/products/magnesium-complex',
                'description' => 'Membantu relaksasi otot dan kualitas tidur.',
                'price' => 70000,
            ],

            // ── Olahraga ──────────────────────────────────────────────
            [
                'category_id' => $olahraga,
                'name' => 'Matras Yoga Anti-Slip',
                'slug' => 'matras-yoga-anti-slip',
                'link' => 'https://example.com/products/matras-yoga-anti-slip',
                'description' => 'Matras yoga TPE tebal 6mm, ringan dan mudah digulung.',
                'price' => 175000,
            ],
            [
                'category_id' => $olahraga,
                'name' => 'Dumbbell 5kg Pasang',
                'slug' => 'dumbbell-5kg-pasang',
                'link' => 'https://example.com/products/dumbbell-5kg-pasang',
                'description' => 'Dumbbell besi dilapisi karet, nyaman digenggam.',
                'price' => 245000,
            ],
            [
                'category_id' => $olahraga,
                'name' => 'Resistance Band Set',
                'slug' => 'resistance-band-set',
                'link' => 'https://example.com/products/resistance-band-set',
                'description' => 'Set 5 karet resistance dengan level kekuatan berbeda.',
                'price' => 98000,
            ],
            [
                'category_id' => $olahraga,
                'name' => 'Sepatu Running Ringan',
                'slug' => 'sepatu-running-ringan',
                'link' => 'https://example.com/products/sepatu-running-ringan',
                'description' => 'Sepatu lari berteknologi cushioning untuk perlindungan sendi.',
                'price' => 420000,
            ],
            [
                'category_id' => $olahraga,
                'name' => 'Skipping Rope Digital',
                'slug' => 'skipping-rope-digital',
                'link' => 'https://example.com/products/skipping-rope-digital',
                'description' => 'Tali skipping dengan counter digital dan timer otomatis.',
                'price' => 75000,
            ],
        ];

        $id = 1;
        foreach ($products as $product) {
            $product['status'] = ProductStatus::Stable;
            $product['product_id'] = "PRD-00$id";
            Product::create($product);

            $id++;
        }
    }
}
