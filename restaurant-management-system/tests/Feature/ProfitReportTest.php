<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

use Inertia\Testing\AssertableInertia as Assert;

class ProfitReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_calculates_profit_correctly()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'manager']);
        $user->roles()->attach($role);

        $category = MenuCategory::create(['name' => 'Main Course', 'slug' => 'main-course']);
        
        // Ingredient Cost: 100 cents
        $ingredient = Ingredient::create([
            'name' => 'Beef Patty',
            'unit' => 'pcs',
            'current_stock' => 100,
            'reorder_level' => 10,
            'cost_per_unit_cents' => 100,
        ]);

        // Menu Item Price: 1000 cents, Cost: 200 cents (2 ingredients)
        $menuItem = MenuItem::create([
            'name' => 'Cheeseburger',
            'price_cents' => 1000,
            'category_id' => $category->id,
            'is_available' => true,
        ]);
        $menuItem->ingredients()->attach($ingredient->id, ['quantity' => 2]);

        // Place Order
        $this->actingAs($user)->postJson('/api/orders', [
            'user_id' => $user->id,
            'guest_phone' => '1234567890',
            'guest_address' => '123 Main St',
            'payment_method' => 'cash',
            'cart' => [
                [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => 1,
                    'modifiers' => [],
                ]
            ]
        ]);

        // Fetch Report
        $response = $this->actingAs($user)->get('/reports');

        $response->assertStatus(200);
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->has('summary', fn (Assert $page) => $page
                ->where('total_cents', 1000)
                ->where('total_cost', 200)
                ->where('gross_profit', 800)
                ->where('profit_margin', 80)
                ->etc()
            )
        );
    }
}
