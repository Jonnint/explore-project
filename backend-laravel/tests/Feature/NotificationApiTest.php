<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

test('authenticated user can get default notification settings', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson('/api/notifications/settings');

    $response->assertStatus(200)
        ->assertJson([
            'settings' => [
                'follow_up_reminders' => true,
                'lead_notifications' => true,
                'product_alerts' => false,
                'conversion_notifications' => true,
            ],
        ]);
});

test('authenticated user can update notification settings', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->putJson('/api/notifications/settings', [
        'follow_up_reminders' => false,
        'lead_notifications' => false,
        'product_alerts' => true,
        'conversion_notifications' => false,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Notification settings updated successfully',
            'settings' => [
                'follow_up_reminders' => false,
                'lead_notifications' => false,
                'product_alerts' => true,
                'conversion_notifications' => false,
            ],
        ]);

    $user->refresh();
    expect($user->getNotificationSettings())->toEqual([
        'follow_up_reminders' => false,
        'lead_notifications' => false,
        'product_alerts' => true,
        'conversion_notifications' => false,
    ]);
});

test('authenticated user can retrieve notifications list', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Insert dummy notifications
    $notificationId = Str::uuid()->toString();
    DB::table('notifications')->insert([
        'id' => $notificationId,
        'type' => 'App\Notifications\TestNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $user->id,
        'data' => json_encode(['title' => 'Test Notification', 'message' => 'Hello World']),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->getJson('/api/notifications');

    $response->assertStatus(200)
        ->assertJsonPath('notifications.data.0.id', $notificationId)
        ->assertJsonPath('notifications.data.0.data.title', 'Test Notification');
});

test('authenticated user can mark a notification as read', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $notificationId = Str::uuid()->toString();
    DB::table('notifications')->insert([
        'id' => $notificationId,
        'type' => 'App\Notifications\TestNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $user->id,
        'data' => json_encode(['title' => 'Test Notification']),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->postJson("/api/notifications/{$notificationId}/read");

    $response->assertStatus(200)
        ->assertJson(['message' => 'Notification marked as read']);

    $notification = DB::table('notifications')->where('id', $notificationId)->first();
    expect($notification->read_at)->not->toBeNull();
});

test('authenticated user can mark all notifications as read', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $notificationId1 = Str::uuid()->toString();
    $notificationId2 = Str::uuid()->toString();

    DB::table('notifications')->insert([
        [
            'id' => $notificationId1,
            'type' => 'App\Notifications\TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => json_encode(['title' => 'Test 1']),
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'id' => $notificationId2,
            'type' => 'App\Notifications\TestNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => json_encode(['title' => 'Test 2']),
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    $response = $this->postJson('/api/notifications/read-all');

    $response->assertStatus(200)
        ->assertJson(['message' => 'All notifications marked as read']);

    $unreadCount = DB::table('notifications')
        ->where('notifiable_id', $user->id)
        ->whereNull('read_at')
        ->count();

    expect($unreadCount)->toBe(0);
});
