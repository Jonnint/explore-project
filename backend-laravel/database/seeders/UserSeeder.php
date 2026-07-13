<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Superadmin
        User::factory()->create([
            'name' => 'Super Admin',
            'phone' => '6282125995606',
            'email' => 'superadmin@example.com',
            'region' => 'Jakarta',
            'role' => 'superadmin',
            'token_limit' => null,
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Admin
        User::factory()->create([
            'name' => 'Admin User',
            'phone' => '6281234567899',
            'email' => 'admin@example.com',
            'region' => 'Banten',
            'role' => 'admin',
            'token_limit' => null,
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Agent
        User::factory()->create([
            'name' => 'Agent Haikal',
            'phone' => '62895629239219',
            'email' => 'agent@example.com',
            'region' => 'Jawa Timur',
            'role' => 'agent',
            'token_limit' => 10000,
            'tokens_used' => 2500,
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Additional test agents
        User::factory()->create([
            'name' => 'Test Agent 1',
            'phone' => '6281122334455',
            'email' => 'test1@example.com',
            'region' => 'Bandung',
            'role' => 'agent',
            'token_limit' => 5000,
            'tokens_used' => 4800,
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Test Agent 2',
            'phone' => '6285566778899',
            'email' => 'test2@example.com',
            'region' => 'Surabaya',
            'role' => 'agent',
            'token_limit' => null,
            'tokens_used' => 0,
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
    }
}
