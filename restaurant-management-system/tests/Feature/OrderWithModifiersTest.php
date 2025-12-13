<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\Modifier;
use App\Models\ModifierGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderWithModifiersTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_place_order_with_modifiers()
    {
        $user = User::factory()->create();
        $role = \App\Models\Role::create(['name' => 'customer']);
        $user->roles()->attach($role);
        
        $category = \App\Models\MenuCategory::create(['name' => 'Coffee', 'slug' => 'coffee']);
        
        $item = MenuItem::create([
            'name' => 'Latte',
            'price_cents' => 500,
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        $group = ModifierGroup::create([
            'name' => 'Milk',
            'min_selection' => 1,
            'max_selection' => 1,
            'is_active' => true,
        ]);

        $modifier = Modifier::create([
            'modifier_group_id' => $group->id,
            'name' => 'Oat Milk',
            'price_cents' => 100,
            'is_available' => true,
        ]);

        $item->modifierGroups()->attach($group->id);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'guest_name' => 'Test User',
            'guest_phone' => '1234567890',
            'guest_address' => '123 Test St',
            'payment_method' => 'cash',
            'cart' => [
                [
                    'menu_item_id' => $item->id,
                    'quantity' => 2,
                    'modifiers' => [
                        ['modifier_id' => $modifier->id]
                    ]
                ]
            ]
        ]);

        $response->assertStatus(201);
        
        // Total should be (500 + 100) * 2 = 1200
        $this->assertDatabaseHas('orders', [
            'total_cents' => 1200,
            'user_id' => $user->id,
        ]);

        $orderId = $response->json('data.id');
        
        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'menu_item_id' => $item->id,
            'unit_price_cents' => 600, // 500 + 100
            'total_price_cents' => 1200,
        ]);

        $this->assertDatabaseHas('order_item_modifiers', [
            'modifier_id' => $modifier->id,
            'modifier_name' => 'Oat Milk',
            'price_cents' => 100,
        ]);
    }
}
