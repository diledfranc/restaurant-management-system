<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_fetch_dashboard_stats()
    {
        $role = Role::create(['name' => 'manager']);
        $user = User::factory()->create();
        $user->roles()->attach($role);
        
        // Create some orders
        $item = MenuItem::factory()->create([
            'price_cents' => 1000, // $10.00
        ]);

        // Order 1: 2 items
        $order1 = Order::factory()->create(['total_cents' => 2000, 'status' => 'completed', 'created_at' => now()]);
        OrderItem::create([
            'order_id' => $order1->id,
            'menu_item_id' => $item->id,
            'name' => $item->name,
            'quantity' => 2,
            'unit_price_cents' => 1000, // Unit price
            'total_price_cents' => 2000,
            'cost_cents' => 600, // Total cost for 2 items (300 each)
        ]);

        // Order 2: 1 item
        $order2 = Order::factory()->create(['total_cents' => 1000, 'status' => 'completed', 'created_at' => now()]);
        OrderItem::create([
            'order_id' => $order2->id,
            'menu_item_id' => $item->id,
            'name' => $item->name,
            'quantity' => 1,
            'unit_price_cents' => 1000,
            'total_price_cents' => 1000,
            'cost_cents' => 300,
        ]);

        $response = $this->actingAs($user->refresh())->get(route('reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('summary', fn ($stats) => $stats
                ->where('total_cents', 3000) // 2000 + 1000
                ->where('orders_count', 2)
                ->where('total_cost', 900) // (2 * 300) + (1 * 300)
                ->where('gross_profit', 2100) // 3000 - 900
                ->etc()
            )
        );
    }
}
