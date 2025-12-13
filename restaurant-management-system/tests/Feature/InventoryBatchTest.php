<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\IngredientBatch;
use App\Models\MenuItem;
use App\Models\Modifier;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryBatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_receiving_stock_creates_batch()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'manager']);
        $user->roles()->attach($role);

        $ingredient = Ingredient::create([
            'name' => 'Test Ingredient',
            'unit' => 'kg',
            'current_stock' => 0,
            'reorder_level' => 10,
            'cost_per_unit_cents' => 100,
        ]);

        $response = $this->actingAs($user)->postJson(route('inventory.receive', $ingredient->id), [
            'quantity' => 10,
            'cost_per_unit_cents' => 150,
            'expiration_date' => now()->addDays(10)->toDateString(),
            'batch_number' => 'BATCH-001',
        ]);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('ingredient_batches', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'cost_per_unit_cents' => 150,
            'batch_number' => 'BATCH-001',
        ]);

        $ingredient->refresh();
        $this->assertEquals(10, $ingredient->current_stock);
        $this->assertEquals(150, $ingredient->cost_per_unit_cents); // Updated to latest cost
    }

    public function test_consuming_stock_uses_fifo()
    {
        $ingredient = Ingredient::create([
            'name' => 'Test Ingredient',
            'unit' => 'kg',
            'current_stock' => 0,
            'reorder_level' => 10,
            'cost_per_unit_cents' => 100,
        ]);

        // Batch 1: Expiring soon (or received earlier)
        $batch1 = IngredientBatch::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'original_quantity' => 10,
            'cost_per_unit_cents' => 100,
            'received_at' => now()->subDays(2),
            'expiration_date' => now()->addDays(5),
        ]);

        // Batch 2: Newer
        $batch2 = IngredientBatch::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'original_quantity' => 10,
            'cost_per_unit_cents' => 120,
            'received_at' => now(),
            'expiration_date' => now()->addDays(10),
        ]);

        $ingredient->update(['current_stock' => 20]);

        // Consume 15 units
        // Should take 10 from Batch 1, and 5 from Batch 2
        $service = app(\App\Services\InventoryService::class);
        $service->consumeStock($ingredient, 15);

        $batch1->refresh();
        $batch2->refresh();
        $ingredient->refresh();

        $this->assertEquals(0, $batch1->quantity);
        $this->assertEquals(5, $batch2->quantity);
        $this->assertEquals(5, $ingredient->current_stock);
    }

    public function test_logging_waste_deducts_stock()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'manager']);
        $user->roles()->attach($role);

        $ingredient = Ingredient::create([
            'name' => 'Test Ingredient',
            'unit' => 'kg',
            'current_stock' => 10,
            'reorder_level' => 10,
            'cost_per_unit_cents' => 100,
        ]);

        $batch = IngredientBatch::create([
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'original_quantity' => 10,
            'cost_per_unit_cents' => 100,
            'received_at' => now(),
        ]);

        $response = $this->actingAs($user)->postJson(route('inventory.waste', $ingredient->id), [
            'quantity' => 2,
            'reason' => 'spoiled',
            'ingredient_batch_id' => $batch->id,
        ]);

        $response->assertStatus(302);

        $this->assertDatabaseHas('waste_logs', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 2,
            'reason' => 'spoiled',
            'loss_amount_cents' => 200,
        ]);

        $ingredient->refresh();
        $batch->refresh();

        $this->assertEquals(8, $ingredient->current_stock);
        $this->assertEquals(8, $batch->quantity);
    }
}
