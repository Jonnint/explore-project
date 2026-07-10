<?php

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\PendingChat;
use App\Models\User;
use App\Notifications\LeadStatusChangedNotification;
use App\Notifications\NewLeadNotification;
use App\Notifications\NewMessageNotification;
use App\Notifications\ProcessingFailedNotification;
use App\Notifications\ProductAlertNotification;
use App\Services\LeadService;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
});

test('new lead notification is sent when lead is created from first contact', function () {
    $user = User::factory()->create(['phone' => '1234567890']);

    $chat = PendingChat::factory()->create([
        'agent_phone' => '1234567890',
        'from' => '0987654321',
        'profile_name' => 'John Doe',
        'body' => 'Halo, saya tertarik dengan produk Anda',
    ]);

    $lead = Lead::firstOrCreate(
        ['phone_number' => $chat->from],
        ['name' => $chat->profile_name, 'agent_phone' => $chat->agent_phone]
    );

    $user->notify(new NewLeadNotification(
        profileName: $chat->profile_name,
        agentPhone: $chat->agent_phone,
        leadId: $lead->id,
    ));

    Notification::assertSentTo($user, NewLeadNotification::class, function ($notification) use ($lead) {
        return $notification->leadId === $lead->id
            && $notification->profileName === 'John Doe';
    });
});

test('new message notification is sent for existing lead', function () {
    $user = User::factory()->create(['phone' => '1234567890']);
    $lead = Lead::factory()->create([
        'agent_phone' => '1234567890',
        'messages' => [['body' => 'previous message']],
    ]);

    $user->notify(new NewMessageNotification(
        profileName: $lead->name,
        agentPhone: $lead->agent_phone,
        leadId: $lead->id,
        messagePreview: 'Halo, ada info harga?',
    ));

    Notification::assertSentTo($user, NewMessageNotification::class, function ($notification) use ($lead) {
        return $notification->leadId === $lead->id;
    });
});

test('lead status change notification is sent when status changes', function () {
    $user = User::factory()->create(['phone' => '1234567890']);
    $lead = Lead::factory()->create([
        'agent_phone' => '1234567890',
        'status' => LeadStatus::Cold->value,
        'last_message_at' => now()->subHours(12),
    ]);

    $service = app(LeadService::class);
    $service->updateLeadStatus($lead);

    Notification::assertSentTo($user, LeadStatusChangedNotification::class, function ($notification) use ($lead) {
        return $notification->leadId === $lead->id
            && $notification->newStatus === LeadStatus::Hot->value;
    });
});

test('lead status change notification is NOT sent when status stays same', function () {
    $user = User::factory()->create(['phone' => '1234567890']);
    $lead = Lead::factory()->create([
        'agent_phone' => '1234567890',
        'status' => LeadStatus::Cold->value,
        'last_message_at' => null,
    ]);

    $service = app(LeadService::class);
    $service->updateLeadStatus($lead);

    Notification::assertNothingSent();
});

test('product alert notification is sent when product is recommended', function () {
    $user = User::factory()->create([
        'phone' => '1234567890',
        'notification_settings' => ['product_alerts' => true],
    ]);

    $notification = new ProductAlertNotification(
        productName: 'Vitamin C',
        productId: 1,
        agentPhone: '1234567890',
    );

    $user->notify($notification);

    Notification::assertSentTo($user, ProductAlertNotification::class, function ($n) {
        return $n->productName === 'Vitamin C' && $n->productId === 1;
    });
});

test('processing failed notification is sent on error', function () {
    $user = User::factory()->create(['phone' => '1234567890']);

    $user->notify(new ProcessingFailedNotification(
        agentPhone: '1234567890',
        errorPreview: 'Chat processing returned no result',
    ));

    Notification::assertSentTo($user, ProcessingFailedNotification::class, function ($notification) {
        return str_contains($notification->errorPreview ?? '', 'Chat processing');
    });
});

test('new lead notification respects lead_notifications preference disabled', function () {
    $user = User::factory()->create([
        'phone' => '1234567890',
        'notification_settings' => ['lead_notifications' => false],
    ]);

    $notification = new NewLeadNotification(
        profileName: 'Jane Doe',
        agentPhone: '1234567890',
        leadId: 1,
    );

    $channels = $notification->via($user);

    expect($channels)->toBe([]);
});
