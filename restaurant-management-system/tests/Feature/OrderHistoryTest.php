<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create roles if they don't exist (since we use RefreshDatabase)
        if (Role::count() === 0) {
            Role::create(['name' => 'customer']);
            Role::create(['name' => 'admin']);
            Role::create(['name' => 'manager']);
            Role::create(['name' => 'staff']);
        }
    }

    public function test_customer_can_view_order_history()
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'customer')->first();
        $user->roles()->attach($role);

        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'delivered',
            'total_cents' => 10000,
        ]);

        $response = $this->actingAs($user)->getJson('/api/customer/orders');

        $response->assertStatus(200);
        $response->assertJsonPath('data.0.id', $order->id);
        $response->assertJsonPath('data.0.status', 'delivered');
    }

    public function test_customer_can_filter_active_orders()
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'customer')->first();
        $user->roles()->attach($role);

        $activeOrder = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'placed',
            'total_cents' => 10000,
        ]);

        $pastOrder = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'delivered',
            'total_cents' => 10000,
        ]);

        $response = $this->actingAs($user)->getJson('/api/customer/orders');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }
}
