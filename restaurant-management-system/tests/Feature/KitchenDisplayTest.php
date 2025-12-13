<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KitchenDisplayTest extends TestCase
{
    use RefreshDatabase;

    public function test_kitchen_api_returns_active_orders()
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'kitchen']);
        $user->roles()->attach($role);

        $category = MenuCategory::create(['name' => 'Main', 'slug' => 'main']);
        $item = MenuItem::create(['name' => 'Burger', 'price_cents' => 1000, 'category_id' => $category->id]);

        // Order 1: Placed (Should appear)
        $order1 = Order::create([
            'user_id' => $user->id,
            'guest_phone' => '123',
            'guest_address' => '123',
            'total_cents' => 1000,
            'payment_method' => 'cash',
            'status' => 'placed'
        ]);
        OrderItem::create(['order_id' => $order1->id, 'menu_item_id' => $item->id, 'quantity' => 1, 'unit_price_cents' => 1000, 'total_price_cents' => 1000, 'cost_cents' => 500]);

        // Order 2: Preparing (Should appear)
        $order2 = Order::create([
            'user_id' => $user->id,
            'guest_phone' => '123',
            'guest_address' => '123',
            'total_cents' => 1000,
            'payment_method' => 'cash',
            'status' => 'preparing'
        ]);
        OrderItem::create(['order_id' => $order2->id, 'menu_item_id' => $item->id, 'quantity' => 1, 'unit_price_cents' => 1000, 'total_price_cents' => 1000, 'cost_cents' => 500]);

        // Order 3: Ready (Should NOT appear in active list for cooking, but maybe in a separate list. 
        // Based on current controller logic, it only fetches 'placed' and 'preparing')
        $order3 = Order::create([
            'user_id' => $user->id,
            'guest_phone' => '123',
            'guest_address' => '123',
            'total_cents' => 1000,
            'payment_method' => 'cash',
            'status' => 'ready'
        ]);

        $response = $this->actingAs($user)->getJson('/api/kitchen/orders');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['id' => $order1->id]);
        $response->assertJsonFragment(['id' => $order2->id]);
        $response->assertJsonMissing(['id' => $order3->id]);
    }

    public function test_kitchen_can_update_status()
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'kitchen']);
        $user->roles()->attach($role);

        $order = Order::create([
            'user_id' => $user->id,
            'guest_phone' => '123',
            'guest_address' => '123',
            'total_cents' => 1000,
            'payment_method' => 'cash',
            'status' => 'placed'
        ]);

        $response = $this->actingAs($user)->patchJson("/api/kitchen/orders/{$order->id}/status", [
            'status' => 'preparing'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'preparing']);

        $response = $this->actingAs($user)->patchJson("/api/kitchen/orders/{$order->id}/status", [
            'status' => 'ready'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'ready']);
    }
}
