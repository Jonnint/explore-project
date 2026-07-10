<?php

namespace Database\Factories;

use App\Models\PendingChat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PendingChat>
 */
class PendingChatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'message_id' => str()->uuid(),
            'from' => $this->faker->phoneNumber(),
            'body' => $this->faker->sentence(),
            'agent_phone' => $this->faker->phoneNumber(),
            'phone_id' => $this->faker->randomNumber(),
            'client_phone' => $this->faker->phoneNumber(),
            'profile_name' => $this->faker->name(),
            'status' => 'pending',
        ];
    }
}
