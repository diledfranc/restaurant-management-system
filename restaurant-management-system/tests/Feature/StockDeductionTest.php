<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockDeductionTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_is_deducted_when_order_is_placed()
    {
        $user = User::factory()->create();
        $category = MenuCategory::create(['name' => 'Main Course', 'slug' => 'main-course']);
        
        $ingredient = Ingredient::create([
            'name' => 'Beef Patty',
            'unit' => 'pcs',
            'current_stock' => 100,
            'reorder_level' => 10,
            'cost' => 1.50,
        ]);

        $menuItem = MenuItem::create([
            'name' => 'Cheeseburger',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
        ]);

        $menuItem->ingredients()->attach($ingredient->id, ['quantity' => 1]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'user_id' => $user->id,
            'guest_phone' => '1234567890',
            'guest_address' => '123 Main St',
            'payment_method' => 'cash',
            'cart' => [
                [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => 2,
                    'modifiers' => [],
                ]
            ]
        ]);

        $response->assertStatus(201);
        
        $this->assertEquals(98, $ingredient->fresh()->current_stock);
    }
}
