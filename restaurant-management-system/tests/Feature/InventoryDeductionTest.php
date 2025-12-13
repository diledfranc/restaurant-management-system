<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\MenuItem;
use App\Models\Modifier;
use App\Models\ModifierGroup;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryDeductionTest extends TestCase
{
    use RefreshDatabase;

    public function test_inventory_is_deducted_when_order_is_placed()
    {
        // 1. Setup Ingredients
        $bun = Ingredient::create([
            'name' => 'Burger Bun',
            'unit' => 'pcs',
            'current_stock' => 100,
            'cost_per_unit_cents' => 500, // 5 baht
        ]);

        $patty = Ingredient::create([
            'name' => 'Beef Patty',
            'unit' => 'pcs',
            'current_stock' => 50,
            'cost_per_unit_cents' => 2000, // 20 baht
        ]);

        $cheese = Ingredient::create([
            'name' => 'Cheese Slice',
            'unit' => 'pcs',
            'current_stock' => 20,
            'cost_per_unit_cents' => 500, // 5 baht
        ]);

        // Add batches (InventoryService consumes from batches first)
        $inventoryService = new InventoryService();
        $inventoryService->receiveStock($bun, 100, 500);
        $inventoryService->receiveStock($patty, 50, 2000);
        $inventoryService->receiveStock($cheese, 20, 500);

        // 2. Setup Menu Item
        $burger = MenuItem::factory()->create([
            'name' => 'Cheeseburger',
            'price_cents' => 15000, // 150 baht
        ]);

        // Attach ingredients to menu item
        $burger->ingredients()->attach([
            $bun->id => ['quantity' => 1],
            $patty->id => ['quantity' => 1],
        ]);

        // 3. Setup Modifier
        $modGroup = ModifierGroup::create([
            'name' => 'Extras',
            'min_selection' => 0,
            'max_selection' => 5,
        ]);
        
        $extraCheese = Modifier::create([
            'modifier_group_id' => $modGroup->id,
            'name' => 'Extra Cheese',
            'price_cents' => 1000, // 10 baht
            'is_available' => true,
        ]);

        // Attach ingredient to modifier
        $extraCheese->ingredients()->attach([
            $cheese->id => ['quantity' => 1],
        ]);

        $bun->refresh();
        dump('Bun Stock Before Order: ' . $bun->current_stock);

        // 4. Place Order
        $payload = [
            'guest_name' => 'John Doe',
            'guest_phone' => '0812345678',
            'guest_address' => '123 Main St',
            'payment_method' => 'cash',
            'cart' => [
                [
                    'menu_item_id' => $burger->id,
                    'quantity' => 2, // 2 Burgers
                    'modifiers' => [
                        ['modifier_id' => $extraCheese->id] // Each with Extra Cheese
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201);

        // 5. Assert Inventory Deduction
        // 2 Burgers = 2 Buns, 2 Patties
        // 2 Extra Cheese = 2 Cheese Slices

        // Bun: 100 + 100 - 2 = 198
        $this->assertDatabaseHas('ingredients', [
            'id' => $bun->id,
            'current_stock' => 198, 
        ]);

        // Patty: 50 + 50 - 2 = 98
        $this->assertDatabaseHas('ingredients', [
            'id' => $patty->id,
            'current_stock' => 98, 
        ]);

        // Cheese: 20 + 20 - 2 = 38
        $this->assertDatabaseHas('ingredients', [
            'id' => $cheese->id,
            'current_stock' => 38, 
        ]);
    }
}
