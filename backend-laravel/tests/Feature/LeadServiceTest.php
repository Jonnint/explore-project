<?php

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Services\LeadService;

test('updateLeadStatus sets hot for messages less than 24 hours ago', function () {
    $lead = Lead::factory()->create([
        'last_message_at' => now()->subHours(12),
        'status' => LeadStatus::Cold->value,
    ]);

    $service = app(LeadService::class);
    $service->updateLeadStatus($lead);

    expect($lead->fresh()->status)->toBe(LeadStatus::Hot->value);
});

test('updateLeadStatus sets warm for messages less than 48 hours ago', function () {
    $lead = Lead::factory()->create([
        'last_message_at' => now()->subHours(30),
        'status' => LeadStatus::Cold->value,
    ]);

    $service = app(LeadService::class);
    $service->updateLeadStatus($lead);

    expect($lead->fresh()->status)->toBe(LeadStatus::Warm->value);
});

test('updateLeadStatus sets cold for messages more than 48 hours ago', function () {
    $lead = Lead::factory()->create([
        'last_message_at' => now()->subHours(50),
        'status' => LeadStatus::Hot->value,
    ]);

    $service = app(LeadService::class);
    $service->updateLeadStatus($lead);

    expect($lead->fresh()->status)->toBe(LeadStatus::Cold->value);
});

test('updateLeadStatus sets cold for null last_message_at', function () {
    $lead = Lead::factory()->create([
        'last_message_at' => null,
        'status' => LeadStatus::Hot->value,
    ]);

    $service = app(LeadService::class);
    $service->updateLeadStatus($lead);

    expect($lead->fresh()->status)->toBe(LeadStatus::Cold->value);
});

test('getLeadStats returns correct counts for agent', function () {
    $agentPhone = '1234567890';

    Lead::factory()->create([
        'agent_phone' => $agentPhone,
        'status' => LeadStatus::Hot->value,
    ]);

    Lead::factory()->create([
        'agent_phone' => $agentPhone,
        'status' => LeadStatus::Warm->value,
    ]);

    Lead::factory()->create([
        'agent_phone' => $agentPhone,
        'status' => LeadStatus::Cold->value,
    ]);

    Lead::factory()->create([
        'agent_phone' => '0987654321',
        'status' => LeadStatus::Hot->value,
    ]);

    $service = app(LeadService::class);
    $stats = $service->getLeadStats($agentPhone);

    expect($stats['hot'])->toBe(1)
        ->and($stats['warm'])->toBe(1)
        ->and($stats['cold'])->toBe(1)
        ->and($stats['total'])->toBe(3);
});

test('updateLastMessageTime updates timestamp and recalculates status', function () {
    $lead = Lead::factory()->create([
        'last_message_at' => now()->subHours(50),
        'status' => LeadStatus::Cold->value,
    ]);

    $service = app(LeadService::class);
    $service->updateLastMessageTime($lead);

    $lead->refresh();

    expect($lead->last_message_at)->not->toBeNull()
        ->and($lead->status)->toBe(LeadStatus::Hot->value);
});
