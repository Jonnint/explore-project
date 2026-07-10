<?php

use App\Models\User;

test('authenticated user can update profile', function () {
    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@example.com',
        'phone' => null,
        'region' => null,
    ]);

    $this->actingAs($user);

    $response = $this->putJson('/api/auth/profile', [
        'name' => 'New Name',
        'email' => 'new@example.com',
        'phone' => '+628123456789',
        'region' => 'Bandung',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Profil berhasil diupdate.',
        ]);

    $response->assertJsonPath('user.name', 'New Name');
    $response->assertJsonPath('user.email', 'new@example.com');
    $response->assertJsonPath('user.phone', '+628123456789');
    $response->assertJsonPath('user.region', 'Bandung');

    $user->refresh();
    expect($user->name)->toBe('New Name');
    expect($user->email)->toBe('new@example.com');
});

test('authenticated user can update profile with partial fields', function () {
    $user = User::factory()->create([
        'name' => 'Original',
        'email' => 'original@example.com',
    ]);

    $this->actingAs($user);
    $response = $this->putJson('/api/auth/profile', [
        'name' => 'Just Name',
        'email' => 'original@example.com',
    ]);

    $response->assertOk();
    expect($user->fresh()->name)->toBe('Just Name');
});

test('profile update requires name and email', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->putJson('/api/auth/profile', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email']);
});

test('profile update requires unique email', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['email' => 'mine@example.com']);
    $this->actingAs($user);

    $response = $this->putJson('/api/auth/profile', [
        'name' => 'Test',
        'email' => 'taken@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('profile update allows same email for own user', function () {
    $user = User::factory()->create(['email' => 'mine@example.com']);
    $this->actingAs($user);

    $response = $this->putJson('/api/auth/profile', [
        'name' => 'Test',
        'email' => 'mine@example.com',
    ]);

    $response->assertOk();
});

test('unauthenticated user cannot update profile', function () {
    $response = $this->putJson('/api/auth/profile', [
        'name' => 'Test',
        'email' => 'test@example.com',
    ]);

    $response->assertStatus(401);
});

test('authenticated user can change password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('current_password'),
    ]);

    $this->actingAs($user);

    $response = $this->putJson('/api/auth/password', [
        'current_password' => 'current_password',
        'password' => 'new_secure_password',
        'password_confirmation' => 'new_secure_password',
    ]);

    $response->assertOk()
        ->assertJson(['message' => 'Password berhasil diubah.']);
});

test('password change requires correct current password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('real_password'),
    ]);

    $this->actingAs($user);

    $response = $this->putJson('/api/auth/password', [
        'current_password' => 'wrong_password',
        'password' => 'new_password',
        'password_confirmation' => 'new_password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['current_password']);
});

test('password change requires confirmation match', function () {
    $user = User::factory()->create([
        'password' => bcrypt('current_pass'),
    ]);

    $this->actingAs($user);

    $response = $this->putJson('/api/auth/password', [
        'current_password' => 'current_pass',
        'password' => 'new_password',
        'password_confirmation' => 'different_password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

test('unauthenticated user cannot change password', function () {
    $response = $this->putJson('/api/auth/password', [
        'current_password' => 'anything',
        'password' => 'new_password',
        'password_confirmation' => 'new_password',
    ]);

    $response->assertStatus(401);
});
