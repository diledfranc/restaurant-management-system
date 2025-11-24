<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Delivery;
use App\Models\ActivityLog;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Categories and menu items
        $categories = MenuCategory::factory()->count(4)->create();
        MenuItem::factory()->count(30)->create();

        // Create orders and attach order items (random menu items)
        $orders = Order::factory()->count(20)->create()->each(function ($order) {
            $items = MenuItem::inRandomOrder()->take(rand(1, 4))->get();

            foreach ($items as $item) {
                $qty = rand(1, 3);
                $unit = $item->price_cents ?? 0;

                OrderItem::factory()->create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item->id,
                    'quantity' => $qty,
                    'unit_price_cents' => $unit,
                    'total_price_cents' => $unit * $qty,
                ]);
            }
        });

        // Create deliveries for about half of the orders
        Order::inRandomOrder()->limit(10)->get()->each(function ($order) {
            Delivery::factory()->create(['order_id' => $order->id]);
        });

        // Activity logs to simulate actions in the app
        ActivityLog::factory()->count(50)->create();
    }
}
