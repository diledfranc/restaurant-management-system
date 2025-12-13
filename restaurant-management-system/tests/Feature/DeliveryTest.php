<?php

namespace Tests\Feature;

use App\Models\Delivery;
use App\Models\Order;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeliveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_claim_delivery()
    {
        $role = Role::create(['name' => 'staff']);
        $staff = User::factory()->create();
        $staff->roles()->attach($role);
        
        $order = Order::create([
            'guest_phone' => '123',
            'guest_address' => 'Address',
            'total_cents' => 1000,
            'payment_method' => 'cash',
            'status' => 'placed'
        ]);

        $delivery = Delivery::create([
            'order_id' => $order->id,
            'status' => 'pending'
        ]);

        $this->actingAs($staff);

        $response = $this->postJson("/api/deliveries/{$delivery->id}/assign", [
            'assigned_user_id' => $staff->id
        ]);

        $response->assertStatus(200);
        $this->assertEquals('assigned', $delivery->fresh()->status);
        $this->assertEquals($staff->id, $delivery->fresh()->assigned_user_id);
    }

    public function test_staff_can_update_status()
    {
        $role = Role::create(['name' => 'staff']);
        $staff = User::factory()->create();
        $staff->roles()->attach($role);
        
        $order = Order::create([
            'guest_phone' => '123',
            'guest_address' => 'Address',
            'total_cents' => 1000,
            'payment_method' => 'cash',
            'status' => 'placed'
        ]);

        $delivery = Delivery::create([
            'order_id' => $order->id,
            'status' => 'assigned',
            'assigned_user_id' => $staff->id
        ]);

        $this->actingAs($staff);

        $response = $this->patchJson("/api/deliveries/{$delivery->id}/status", [
            'status' => 'picked_up'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('picked_up', $delivery->fresh()->status);
        $this->assertNotNull($delivery->fresh()->pickup_time);
        $this->assertEquals('on_way', $order->fresh()->status);
    }
}
