<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCostSnapshotTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_item_snapshots_cost_at_time_of_order()
    {
        $user = User::factory()->create();
        $category = MenuCategory::create(['name' => 'Main Course', 'slug' => 'main-course']);
        
        // Create Ingredient with cost 100 cents
        $ingredient = Ingredient::create([
            'name' => 'Beef Patty',
            'unit' => 'pcs',
            'current_stock' => 100,
            'reorder_level' => 10,
            'cost_per_unit_cents' => 100,
        ]);

        // Create Menu Item using 2 units of ingredient (Cost = 200 cents)
        $menuItem = MenuItem::create([
            'name' => 'Cheeseburger',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
        ]);
        $menuItem->ingredients()->attach($ingredient->id, ['quantity' => 2]);

        // Place Order
        $response = $this->actingAs($user)->postJson('/api/orders', [
            'user_id' => $user->id,
            'guest_phone' => '1234567890',
            'guest_address' => '123 Main St',
            'payment_method' => 'cash',
            'cart' => [
                [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => 1,
                    'modifiers' => [],
                ]
            ]
        ]);

        $response->assertStatus(201);
        
        $order = \App\Models\Order::first();
        $orderItem = $order->items->first();

        // Assert cost is 200
        $this->assertEquals(200, $orderItem->cost_cents);

        // Change ingredient cost to 500
        $ingredient->update(['cost_per_unit_cents' => 500]);

        // Assert order item cost remains 200 (snapshot)
        $this->assertEquals(200, $orderItem->fresh()->cost_cents);
        
        // Assert new calculation would be 1000
        $this->assertEquals(1000, $menuItem->fresh()->cost_cents);
    }
}
