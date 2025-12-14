<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\IngredientBatch;
use App\Models\WasteLog;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Receive new stock (create a batch).
     */
    public function receiveStock(Ingredient $ingredient, float $quantity, int $costPerUnitCents, ?string $expirationDate = null, ?string $batchNumber = null)
    {
        return DB::transaction(function () use ($ingredient, $quantity, $costPerUnitCents, $expirationDate, $batchNumber) {
            $batch = $ingredient->batches()->create([
                'quantity' => $quantity,
                'original_quantity' => $quantity,
                'cost_per_unit_cents' => $costPerUnitCents,
                'expiration_date' => $expirationDate,
                'batch_number' => $batchNumber,
                'received_at' => now(),
            ]);

            // Update aggregate stock and weighted average cost (optional, but good for simple reporting)
            $ingredient->increment('current_stock', $quantity);
            
            // Update the master cost to the latest batch cost (or weighted average if preferred, but latest is common for replacement cost)
            // Let's stick to updating it to the latest received cost for now as a "current market price" indicator
            $ingredient->update(['cost_per_unit_cents' => $costPerUnitCents]);

            return $batch;
        });
    }

    /**
     * Consume stock (FIFO).
     */
    public function consumeStock(Ingredient $ingredient, float $quantity)
    {
        return DB::transaction(function () use ($ingredient, $quantity) {
            $remainingToDeduct = $quantity;

            // Get batches with stock, ordered by expiration date (if available) or received date (FIFO)
            // Prioritize expiring soonest. NULL expiration (non-perishable) comes last.
            $batches = $ingredient->batches()
                ->where('quantity', '>', 0)
                ->orderByRaw('CASE WHEN expiration_date IS NULL THEN 1 ELSE 0 END, expiration_date ASC')
                ->orderBy('received_at', 'ASC')
                ->lockForUpdate()
                ->get();

            foreach ($batches as $batch) {
                if ($remainingToDeduct <= 0) break;

                $deductFromBatch = min($batch->quantity, $remainingToDeduct);
                
                $batch->decrement('quantity', $deductFromBatch);
                $remainingToDeduct -= $deductFromBatch;
            }

            // Always decrement the master stock, even if we didn't have enough in batches (negative stock allowed? or just zero?)
            // If we allow negative stock, it means we have "untracked" inventory.
            // For now, let's just decrement.
            $ingredient->decrement('current_stock', $quantity);
            
            // Refresh to get the updated value from DB
            $ingredient->refresh();

            if ($ingredient->current_stock <= $ingredient->reorder_level) {
                \App\Events\LowStockDetected::dispatch($ingredient);
            }
        });
    }

    /**
     * Log waste.
     */
    public function logWaste(Ingredient $ingredient, float $quantity, string $reason, int $userId, ?string $notes = null, ?int $batchId = null)
    {
        return DB::transaction(function () use ($ingredient, $quantity, $reason, $userId, $notes, $batchId) {
            $cost = 0;

            if ($batchId) {
                $batch = IngredientBatch::find($batchId);
                if ($batch) {
                    $deduct = min($batch->quantity, $quantity);
                    $batch->decrement('quantity', $deduct);
                    $cost = $deduct * $batch->cost_per_unit_cents;
                    
                    // If we are wasting more than what's in the batch, we need to decide what to do.
                    // For simplicity, let's assume UI prevents selecting a batch with insufficient quantity,
                    // or we just take what we can and the rest is "general" waste.
                    // But let's stick to: if batch is selected, we deduct from it.
                }
            } else {
                // General waste (FIFO deduction logic similar to consumeStock, but we need to calculate cost)
                $remainingToDeduct = $quantity;
                $batches = $ingredient->batches()
                    ->where('quantity', '>', 0)
                    ->orderByRaw('CASE WHEN expiration_date IS NULL THEN 1 ELSE 0 END, expiration_date ASC')
                    ->orderBy('received_at', 'ASC')
                    ->lockForUpdate()
                    ->get();

                foreach ($batches as $batch) {
                    if ($remainingToDeduct <= 0) break;

                    $deductFromBatch = min($batch->quantity, $remainingToDeduct);
                    $batch->decrement('quantity', $deductFromBatch);
                    $cost += $deductFromBatch * $batch->cost_per_unit_cents;
                    $remainingToDeduct -= $deductFromBatch;
                }
                
                // If we still have remaining to deduct (meaning we wasted more than we have in batches),
                // we use the current ingredient master cost for the remainder.
                if ($remainingToDeduct > 0) {
                    $cost += $remainingToDeduct * $ingredient->cost_per_unit_cents;
                }
            }

            $ingredient->decrement('current_stock', $quantity);

            return WasteLog::create([
                'ingredient_id' => $ingredient->id,
                'ingredient_batch_id' => $batchId,
                'user_id' => $userId,
                'quantity' => $quantity,
                'reason' => $reason,
                'loss_amount_cents' => (int) $cost,
                'notes' => $notes,
            ]);
        });
    }
}
