<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition()
    {
        return [
            'user_id' => null,
            'action_type' => $this->faker->randomElement(['created','updated','deleted','login']),
            'model_type' => null,
            'model_id' => null,
            'payload' => null,
            'ip' => $this->faker->ipv4(),
        ];
    }
}
