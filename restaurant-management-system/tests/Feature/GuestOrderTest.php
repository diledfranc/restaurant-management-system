<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\Modifier;
use App\Models\ModifierGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_place_order_with_modifiers()
    {
        // Setup menu item and modifiers
        $item = MenuItem::create([
            'name' => 'Burger',
            'price_cents' => 1000,
            'is_available' => true,
            'category_id' => null
        ]);

        $group = ModifierGroup::create([
            'name' => 'Toppings',
            'min_selection' => 0,
            'max_selection' => 5
        ]);

        $modifier = Modifier::create([
            'modifier_group_id' => $group->id,
            'name' => 'Cheese',
            'price_cents' => 100,
            'cost_cents' => 50,
            'is_available' => true
        ]);

        $item->modifierGroups()->attach($group->id);

        $payload = [
            'guest_name' => 'John Doe',
            'guest_phone' => '1234567890',
            'guest_address' => '123 Main St',
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
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('orders', [
            'guest_name' => 'John Doe',
            'total_cents' => 2200, // (1000 + 100) * 2
        ]);

        $this->assertDatabaseHas('order_items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
            'unit_price_cents' => 1100,
        ]);
    }
}
