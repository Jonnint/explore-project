<?php

use App\Http\Controllers\Api\AgentLinkController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KnowledgeBaseController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\LinkClickController;
use App\Http\Controllers\Api\ManualWhatsAppMessageController;
use App\Http\Controllers\Api\NotificationApiController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserDashboardController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\WhatsAppTemplateController;
use App\Http\Controllers\Api\WhatsAppTemplateMessageController;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\Whatsapp\SalesAssistController;
use App\Http\Controllers\Whatsapp\WhatsAppController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Auth (public) ────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login', [ApiAuthController::class, 'login']);
    Route::post('/register', [ApiAuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [ApiAuthController::class, 'logout']);
        Route::get('/me', [ApiAuthController::class, 'me']);
        Route::put('/profile', [ApiAuthController::class, 'updateProfile']);
        Route::put('/password', [ApiAuthController::class, 'updatePassword']);
    });
});

// ── Protected routes ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $r) => $r->user());
    Route::get('/link-clicks', [LinkClickController::class, 'indexApi']);
    Route::post('/whatsapp/test-connection', [WhatsAppController::class, 'testConnection']);
    Route::post('/whatsapp/send-message', [ManualWhatsAppMessageController::class, 'store']);
    Route::get('/whatsapp/templates', [WhatsAppTemplateController::class, 'index']);
    Route::post('/whatsapp/templates', [WhatsAppTemplateController::class, 'store']);
    Route::get('/whatsapp/templates/{template}', [WhatsAppTemplateController::class, 'show']);
    Route::delete('/whatsapp/templates/{template}', [WhatsAppTemplateController::class, 'destroy']);
    Route::post('/whatsapp/send-template', [WhatsAppTemplateMessageController::class, 'store']);

    // Category
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::get('/my-links', [AgentLinkController::class, 'index']);
    Route::get('/my-links/stats', [AgentLinkController::class, 'stats']);
    Route::get('/my-links/{code}', [AgentLinkController::class, 'show']);

    // Dashboard (admin/superadmin)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // User Dashboard
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', [UserDashboardController::class, 'index']);
        Route::get('/chat-logs', [UserDashboardController::class, 'chatLogs']);
        Route::get('/chat-history', [UserDashboardController::class, 'chatHistory']);
    });

    // Leads
    Route::get('/leads', [LeadController::class, 'index']);
    Route::get('/leads/stats', [LeadController::class, 'getStats']);
    Route::get('/leads/{id}', [LeadController::class, 'show']);
    Route::post('/leads/{id}/update-message', [LeadController::class, 'updateLastMessage']);

    // Knowledge Base
    Route::get('/knowledge-base/search', [KnowledgeBaseController::class, 'search']);
    Route::post('/knowledge-base/append', [KnowledgeBaseController::class, 'append']);
    Route::apiResource('knowledge-base', KnowledgeBaseController::class)->except(['create', 'edit']);

    // Notifications
    Route::get('/notifications', [NotificationApiController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationApiController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationApiController::class, 'markAllAsRead']);
    Route::get('/notifications/settings', [NotificationApiController::class, 'getSettings']);
    Route::put('/notifications/settings', [NotificationApiController::class, 'updateSettings']);

    // User Management
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::get('/users/roles', [UserManagementController::class, 'getRoles']);
    Route::get('/users/{id}', [UserManagementController::class, 'show']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::put('/users/{id}', [UserManagementController::class, 'update']);
    Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
    Route::post('/users/{id}/reset-token', [UserManagementController::class, 'resetToken']);
    Route::post('/users/{id}/verify', [UserManagementController::class, 'verify']);
    Route::post('/users/{id}/unverify', [UserManagementController::class, 'unverify']);
    Route::post('/users/{id}/activate', [UserManagementController::class, 'activate']);
    Route::post('/users/{id}/deactivate', [UserManagementController::class, 'deactivate']);
});

// ── Public routes ─────────────────────────────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/lookup', [ProductController::class, 'lookup']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::post('/chat', [SalesAssistController::class, 'analyze']);

Route::get('/webhook/whatsapp', [WhatsAppController::class, 'verify']);
Route::post('/webhook/whatsapp', [WhatsAppController::class, 'receive']);
