<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        $paymentMethods = ['cash','transfer'];
        $statuses = ['placed','preparing','on_way','delivered','cancelled'];

        return [
            'user_id' => null,
            'guest_name' => $this->faker->name(),
            'guest_phone' => $this->faker->phoneNumber(),
            'guest_address' => $this->faker->address(),
            'total_cents' => 0,
            'payment_method' => $this->faker->randomElement($paymentMethods),
            'status' => 'placed',
            'assigned_to' => null,
        ];
    }
}
