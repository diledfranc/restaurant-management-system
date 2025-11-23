<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\Order;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition()
    {
        $menuItem = MenuItem::factory()->create();
        $qty = $this->faker->numberBetween(1,4);
        $unit = $menuItem->price_cents ?? $this->faker->numberBetween(100,1000);

        return [
            'order_id' => Order::factory(),
            'menu_item_id' => $menuItem->id,
            'quantity' => $qty,
            'unit_price_cents' => $unit,
            'total_price_cents' => $unit * $qty,
            'notes' => null,
        ];
    }
}
