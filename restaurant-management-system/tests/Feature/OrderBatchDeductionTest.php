<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\IngredientBatch;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderBatchDeductionTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_deducts_from_batches()
    {
        $user = User::factory()->create();
        $category = MenuCategory::create(['name' => 'Main Course', 'slug' => 'main-course']);
        
        $ingredient = Ingredient::create([
            'name' => 'Beef Patty',
            'unit' => 'pcs',
            'current_stock' => 0,
            'reorder_level' => 10,
            'cost_per_unit_cents' => 100,
        ]);

        // Batch 1: 5 units
        $batch1 = IngredientBatch::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 5,
            'original_quantity' => 5,
            'cost_per_unit_cents' => 100,
            'received_at' => now()->subDay(),
        ]);

        // Batch 2: 10 units
        $batch2 = IngredientBatch::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'original_quantity' => 10,
            'cost_per_unit_cents' => 100,
            'received_at' => now(),
        ]);

        $ingredient->update(['current_stock' => 15]);

        $menuItem = MenuItem::create([
            'name' => 'Cheeseburger',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        $menuItem->ingredients()->attach($ingredient->id, ['quantity' => 1]);

        // Order 7 burgers
        $response = $this->actingAs($user)->postJson('/api/orders', [
            'user_id' => $user->id,
            'guest_phone' => '1234567890',
            'guest_address' => '123 Main St',
            'payment_method' => 'cash',
            'cart' => [
                [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => 7,
                    'modifiers' => [],
                ]
            ]
        ]);

        $response->assertStatus(201);

        $batch1->refresh();
        $batch2->refresh();
        $ingredient->refresh();

        // Batch 1 should be empty (5 - 5 = 0)
        $this->assertEquals(0, $batch1->quantity);
        // Batch 2 should have 8 remaining (10 - 2 = 8)
        $this->assertEquals(8, $batch2->quantity);
        // Total stock should be 8
        $this->assertEquals(8, $ingredient->current_stock);
    }
}
