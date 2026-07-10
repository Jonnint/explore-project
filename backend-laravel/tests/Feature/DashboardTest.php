<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('api dashboard returns json with insights structure', function () {
    $user = User::factory()->create(['phone' => '1234567890']);
    $this->actingAs($user);

    $response = $this->getJson('/api/dashboard');
    $response->assertOk()
        ->assertJsonStructure([
            'products',
            'summary',
            'top_converting',
            'sales_trend',
            'priority_leads',
            'lead_stats',
            'insights' => [
                '*' => [
                    'title',
                    'description',
                    'action_text',
                    'action_type',
                ],
            ],
        ]);
});
