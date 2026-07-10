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
        User::factory()->create([
            'name' => 'Test User',
            'phone' => '6282125995606',
            'email' => 'test@example.com',
            'region' => 'Jakarta',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Kang Hyewon',
            'phone' => '6281234567899',
            'email' => 'hyewon@example.com',
            'region' => 'Banten',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Haikal',
            'phone' => '62895629239219',
            'email' => 'haikal@example.com',
            'region' => 'Jawa Timur',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Kamu bisa tambahkan user admin atau user lain di sini
        // User::factory(5)->create();
    }
}
