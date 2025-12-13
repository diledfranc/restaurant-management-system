<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KitchenController extends Controller
{
    public function index()
    {
        return Inertia::render('kitchen/index');
    }

    public function apiIndex()
    {
        // Fetch orders that are 'placed' or 'preparing'
        $orders = Order::with(['items.menuItem', 'items.modifiers'])
            ->whereIn('status', ['placed', 'preparing'])
            ->orderBy('created_at', 'asc')
            ->get();

        return OrderResource::collection($orders);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:preparing,ready,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Order status updated']);
    }
}
