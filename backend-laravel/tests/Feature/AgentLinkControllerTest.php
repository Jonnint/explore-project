<?php

use App\Models\Category;
use App\Models\LinkClick;
use App\Models\Product;
use App\Models\ShortLink;
use App\Models\User;

test('api my-links returns paginated short links with sessional click count', function () {
    $user = User::factory()->create(['phone' => '1234567890']);
    $this->actingAs($user);

    $category = Category::create([
        'name' => 'Test Category',
        'slug' => 'test-category',
    ]);

    $product = Product::create([
        'product_id' => 'PRD-999',
        'category_id' => $category->id,
        'name' => 'Test Product',
        'slug' => 'test-product',
        'link' => 'https://example.com/test',
        'status' => 'stable',
    ]);

    // Create a short link for this agent (earlier)
    $link1 = ShortLink::forceCreate([
        'code' => 'abc',
        'product_slug' => $product->slug,
        'conversation_id' => 'conv_1',
        'agent_phone' => '1234567890',
        'client_phone' => '0987654321',
        'created_at' => now()->subMinutes(10),
    ]);

    // Create another short link for this agent (latest)
    $link2 = ShortLink::forceCreate([
        'code' => 'def',
        'product_slug' => $product->slug,
        'conversation_id' => 'conv_2',
        'agent_phone' => '1234567890',
        'client_phone' => '0987654321',
        'created_at' => now(),
    ]);

    // Create clicks for link1 (same code & conversation)
    LinkClick::create([
        'track_code' => 'abc',
        'conversation_id' => 'conv_1',
        'product_id' => $product->id,
        'agent_phone' => '1234567890',
        'client_phone' => '0987654321',
        'original_url' => $product->link,
    ]);
    LinkClick::create([
        'track_code' => 'abc',
        'conversation_id' => 'conv_1',
        'product_id' => $product->id,
        'agent_phone' => '1234567890',
        'client_phone' => '0987654321',
        'original_url' => $product->link,
    ]);

    // Create a click for link1 but with different conversation_id (should not be counted in sessional click count)
    LinkClick::create([
        'track_code' => 'abc',
        'conversation_id' => 'conv_other',
        'product_id' => $product->id,
        'agent_phone' => '1234567890',
        'client_phone' => '0987654321',
        'original_url' => $product->link,
    ]);

    // Create a click for link2 (same code & conversation)
    LinkClick::create([
        'track_code' => 'def',
        'conversation_id' => 'conv_2',
        'product_id' => $product->id,
        'agent_phone' => '1234567890',
        'client_phone' => '0987654321',
        'original_url' => $product->link,
    ]);

    $response = $this->getJson('/api/my-links');

    $response->assertStatus(200)
        ->assertJsonPath('data.0.code', 'def')
        ->assertJsonPath('data.0.click_count', 1)
        ->assertJsonPath('data.1.code', 'abc')
        ->assertJsonPath('data.1.click_count', 2);
});
