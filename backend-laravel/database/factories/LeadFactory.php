<?php

namespace Database\Factories;

use App\Enums\LeadStatus;
use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'phone_number' => $this->faker->phoneNumber(),
            'name' => $this->faker->name(),
            'product' => $this->faker->word(),
            'status' => LeadStatus::Cold->value,
            'last_message_at' => null,
            'agent_phone' => $this->faker->phoneNumber(),
        ];
    }
}
