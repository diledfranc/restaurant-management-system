<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_view_inventory()
    {
        $user = User::factory()->create();
        $role = \App\Models\Role::create(['name' => 'manager']);
        $user->roles()->attach($role);

        $response = $this->actingAs($user)->get('/inventory');

        $response->assertStatus(200);
    }

    public function test_manager_can_create_ingredient()
    {
        $user = User::factory()->create();
        $role = \App\Models\Role::create(['name' => 'manager']);
        $user->roles()->attach($role);

        $response = $this->actingAs($user)->post('/inventory', [
            'name' => 'Coffee Beans',
            'unit' => 'kg',
            'current_stock' => 10,
            'reorder_level' => 2,
            'cost_per_unit_cents' => 1500,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('ingredients', [
            'name' => 'Coffee Beans',
            'current_stock' => 10,
        ]);
    }

    public function test_manager_can_update_ingredient()
    {
        $user = User::factory()->create();
        $role = \App\Models\Role::create(['name' => 'manager']);
        $user->roles()->attach($role);

        $ingredient = Ingredient::create([
            'name' => 'Old Name',
            'unit' => 'kg',
            'current_stock' => 5,
            'reorder_level' => 1,
            'cost_per_unit_cents' => 1000,
        ]);

        $response = $this->actingAs($user)->put("/inventory/{$ingredient->id}", [
            'name' => 'New Name',
            'unit' => 'kg',
            'current_stock' => 20,
            'reorder_level' => 5,
            'cost_per_unit_cents' => 1200,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('ingredients', [
            'id' => $ingredient->id,
            'name' => 'New Name',
            'current_stock' => 20,
        ]);
    }

    public function test_manager_can_delete_ingredient()
    {
        $user = User::factory()->create();
        $role = \App\Models\Role::create(['name' => 'manager']);
        $user->roles()->attach($role);

        $ingredient = Ingredient::create([
            'name' => 'To Delete',
            'unit' => 'kg',
            'current_stock' => 0,
            'reorder_level' => 0,
            'cost_per_unit_cents' => 0,
        ]);

        $response = $this->actingAs($user)->delete("/inventory/{$ingredient->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('ingredients', [
            'id' => $ingredient->id,
        ]);
    }
}
