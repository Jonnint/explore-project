<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductService $productService) {}

    public function index(Request $request)
    {
        $search = $request->query('search');
        $category = $request->query('category');

        return response()->json([
            'products' => $this->productService->getProductPerformance($search, $category, true),
            'stats' => $this->productService->getProductStats(),
        ]);
    }

    public function lookup(Request $request)
    {
        $query = Product::query();

        if ($request->filled('ids')) {
            $ids = array_map('intval', explode(',', $request->input('ids')));
            $query->whereIn('id', $ids);
        } elseif ($request->filled('search')) {
            $query->where('name', 'ilike', '%'.$request->input('search').'%');
        }

        return $query->get(['id', 'name']);
    }
}
