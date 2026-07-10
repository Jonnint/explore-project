<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Services\LeadService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
        private ProductService $productService,
        private LeadService $leadService
    ) {}

    public function index(Request $request)
    {
        $search = $request->query('search');
        $category = $request->query('category');
        $agentPhone = Auth::user()->phone;
        $nocache = $request->has('nocache') || $request->has('refresh');

        $products = $this->productService->getProductPerformance($search, $category);
        $summary = $this->dashboardService->getSummary();
        $topConverting = $this->dashboardService->getTopConvertingProducts();
        $salesTrend = $this->dashboardService->getSalesTrend();
        $priorityLeads = $this->dashboardService->getPriorityLeads();
        $leadStats = $this->leadService->getLeadStats($agentPhone);
        $activeCustomerHours = $this->dashboardService->getActiveCustomerHours($agentPhone);

        $dashboardData = [
            'products' => $products,
            'summary' => $summary,
            'top_converting' => $topConverting,
            'sales_trend' => $salesTrend,
            'priority_leads' => $priorityLeads,
            'lead_stats' => $leadStats,
            'active_customer_hours' => $activeCustomerHours,
        ];

        $dashboardData['insights'] = $this->dashboardService->getInsights($dashboardData, $nocache);

        return response()->json($dashboardData);
    }
}
