<?php

namespace App\Observers;

use App\Models\Ingredient;

class IngredientObserver
{
    /**
     * Handle the Ingredient "created" event.
     */
    public function created(Ingredient $ingredient): void
    {
        //
    }

    /**
     * Handle the Ingredient "updated" event.
     */
    public function updated(Ingredient $ingredient): void
    {
        if ($ingredient->isDirty('current_stock') && 
            $ingredient->current_stock <= $ingredient->reorder_level &&
            $ingredient->getOriginal('current_stock') > $ingredient->reorder_level) {
            
            // Notify admins/managers
            $admins = \App\Models\User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['admin', 'manager']);
            })->get();

            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\LowStockAlert($ingredient));
            }
        }
    }

    /**
     * Handle the Ingredient "deleted" event.
     */
    public function deleted(Ingredient $ingredient): void
    {
        //
    }

    /**
     * Handle the Ingredient "restored" event.
     */
    public function restored(Ingredient $ingredient): void
    {
        //
    }

    /**
     * Handle the Ingredient "force deleted" event.
     */
    public function forceDeleted(Ingredient $ingredient): void
    {
        //
    }
}
