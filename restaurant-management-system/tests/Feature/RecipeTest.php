<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecipeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_attach_ingredients_to_menu_item()
    {
        $user = User::factory()->create();
        $role = \App\Models\Role::create(['name' => 'admin']);
        $user->roles()->attach($role);
        
        $category = MenuCategory::create(['name' => 'Main Course', 'slug' => 'main-course']);
        $ingredient1 = Ingredient::create([
            'name' => 'Beef Patty',
            'unit' => 'pcs',
            'current_stock' => 100,
            'reorder_level' => 10,
            'cost' => 1.50,
        ]);
        $ingredient2 = Ingredient::create([
            'name' => 'Cheese Slice',
            'unit' => 'pcs',
            'current_stock' => 100,
            'reorder_level' => 10,
            'cost' => 0.50,
        ]);

        $response = $this->actingAs($user)->postJson('/api/menu-items', [
            'name' => 'Cheeseburger',
            'description' => 'Delicious',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
            'ingredients' => [
                ['id' => $ingredient1->id, 'quantity' => 1],
                ['id' => $ingredient2->id, 'quantity' => 2],
            ],
        ]);

        $response->assertStatus(201);
        
        $menuItem = MenuItem::first();
        $this->assertCount(2, $menuItem->ingredients);
        $this->assertEquals(1, $menuItem->ingredients->find($ingredient1->id)->pivot->quantity);
        $this->assertEquals(2, $menuItem->ingredients->find($ingredient2->id)->pivot->quantity);
    }

    public function test_can_update_ingredients_on_menu_item()
    {
        $user = User::factory()->create();
        $role = \App\Models\Role::create(['name' => 'admin']);
        $user->roles()->attach($role);

        $category = MenuCategory::create(['name' => 'Main Course', 'slug' => 'main-course']);
        $ingredient1 = Ingredient::create(['name' => 'Beef', 'unit' => 'kg', 'current_stock' => 10, 'reorder_level' => 1, 'cost' => 10]);
        
        $menuItem = MenuItem::create([
            'name' => 'Burger',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
        ]);
        
        $menuItem->ingredients()->attach($ingredient1->id, ['quantity' => 0.2]);

        $response = $this->actingAs($user)->putJson("/api/menu-items/{$menuItem->id}", [
            'name' => 'Burger',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
            'ingredients' => [
                ['id' => $ingredient1->id, 'quantity' => 0.3], // Update quantity
            ],
        ]);

        $response->assertStatus(200);
        
        $this->assertEquals(0.3, $menuItem->fresh()->ingredients->first()->pivot->quantity);
    }
}
