<?php

namespace Database\Factories;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryFactory extends Factory
{
    protected $model = Delivery::class;

    public function definition()
    {
        return [
            'order_id' => Order::factory(),
            'assigned_user_id' => null,
            'status' => 'assigned',
            'pickup_time' => null,
            'delivered_time' => null,
        ];
    }
}
