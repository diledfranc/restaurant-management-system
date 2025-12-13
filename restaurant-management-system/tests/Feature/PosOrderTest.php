<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\IngredientBatch;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Modifier;
use App\Models\ModifierGroup;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_pos_order_deducts_stock_and_handles_modifiers()
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'cashier']);
        $user->roles()->attach($role);

        // 1. Setup Inventory
        $ingredient = Ingredient::create([
            'name' => 'Beef Patty',
            'unit' => 'pcs',
            'current_stock' => 10,
            'reorder_level' => 5,
            'cost_per_unit_cents' => 100,
        ]);
        // Create a batch
        IngredientBatch::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'original_quantity' => 10,
            'cost_per_unit_cents' => 100,
            'received_at' => now(),
        ]);

        // 2. Setup Menu Item
        $category = MenuCategory::create(['name' => 'Main', 'slug' => 'main']);
        $menuItem = MenuItem::create([
            'name' => 'Burger',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
        ]);
        $menuItem->ingredients()->attach($ingredient->id, ['quantity' => 1]);

        // 3. Setup Modifier
        $modGroup = ModifierGroup::create(['name' => 'Extras', 'is_required' => false, 'is_multiple' => true]);
        $menuItem->modifierGroups()->attach($modGroup->id);
        
        $cheeseIngredient = Ingredient::create([
            'name' => 'Cheese Slice',
            'unit' => 'pcs',
            'current_stock' => 10,
            'reorder_level' => 5,
            'cost_per_unit_cents' => 50,
        ]);
        IngredientBatch::create([
            'ingredient_id' => $cheeseIngredient->id,
            'quantity' => 10,
            'original_quantity' => 10,
            'cost_per_unit_cents' => 50,
            'received_at' => now(),
        ]);

        $modifier = Modifier::create([
            'modifier_group_id' => $modGroup->id,
            'name' => 'Extra Cheese',
            'price_cents' => 200,
            'is_available' => true,
        ]);
        $modifier->ingredients()->attach($cheeseIngredient->id, ['quantity' => 1]);

        // 4. Place POS Order
        $response = $this->actingAs($user)->postJson(route('pos.store'), [
            'items' => [
                [
                    'id' => $menuItem->id,
                    'quantity' => 2,
                    'notes' => 'No onions',
                    'modifiers' => [
                        ['modifier_id' => $modifier->id]
                    ]
                ]
            ],
            'payment_method' => 'cash',
            'guest_name' => 'John Doe',
        ]);

        if ($response->status() !== 201) {
            dump($response->json());
        }

        $response->assertStatus(201);

        // 5. Verify Stock Deduction
        $ingredient->refresh();
        $cheeseIngredient->refresh();

        // Burger uses 1 patty * 2 qty = 2 patties deducted
        $this->assertEquals(8, $ingredient->current_stock);

        // Modifier uses 1 cheese * 2 qty (wait, modifiers are per item usually)
        // If I order 2 Burgers, and apply "Extra Cheese", does it apply to both?
        // Usually in POS, if you group them, yes.
        // My test payload structure implies 1 set of modifiers for the line item.
        // So if quantity is 2, modifiers should be applied 2 times.
        $this->assertEquals(8, $cheeseIngredient->current_stock);

        // 6. Verify Order Cost Snapshot
        $order = \App\Models\Order::first();
        $orderItem = $order->items->first();
        
        // Cost = (Patty Cost 100 + Cheese Cost 50) * 2 = 300
        $this->assertEquals(300, $orderItem->cost_cents);
        
        // Price = (Burger 1000 + Cheese 200) * 2 = 2400
        $this->assertEquals(2400, $orderItem->total_price_cents);
    }
}
