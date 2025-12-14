<?php

namespace App\Listeners;

use App\Events\LowStockDetected;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogLowStockAlert
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(LowStockDetected $event): void
    {
        \Illuminate\Support\Facades\Log::warning("Low Stock Alert: Ingredient '{$event->ingredient->name}' (ID: {$event->ingredient->id}) is running low. Current Stock: {$event->ingredient->current_stock} {$event->ingredient->unit}. Reorder Level: {$event->ingredient->reorder_level}.");
    }
}
