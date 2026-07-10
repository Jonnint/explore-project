<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationApiController extends Controller
{
    /**
     * Get a paginated list of notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(15);

        return response()->json([
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Get the user's notification preferences.
     */
    public function getSettings(Request $request): JsonResponse
    {
        return response()->json([
            'settings' => $request->user()->getNotificationSettings(),
        ]);
    }

    /**
     * Update the user's notification preferences.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'follow_up_reminders' => 'required|boolean',
            'lead_notifications' => 'required|boolean',
            'product_alerts' => 'required|boolean',
            'conversion_notifications' => 'required|boolean',
        ]);

        $user = $request->user();
        $currentSettings = $user->notification_settings ?? [];

        // Update preferences (explicitly excluding ai_credit_warnings from validation input)
        $user->notification_settings = array_merge($currentSettings, $validated);
        $user->save();

        return response()->json([
            'message' => 'Notification settings updated successfully',
            'settings' => $user->getNotificationSettings(),
        ]);
    }
}
