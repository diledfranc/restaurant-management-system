<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::with(['items' => function ($query) {
            $query->where('is_available', true);
        }])->get();

        return Inertia::render('pos/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'payment_method' => 'required|string', // cash, card
            'guest_name' => 'nullable|string',
            'table_number' => 'nullable|string', // if applicable
        ]);

        DB::beginTransaction();
        try {
            $totalCents = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::find($itemData['id']);
                $lineTotal = $menuItem->price_cents * $itemData['quantity'];
                $totalCents += $lineTotal;

                $orderItemsData[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price_cents' => $menuItem->price_cents,
                    'total_price_cents' => $lineTotal,
                    'notes' => $itemData['notes'] ?? null,
                ];
            }

            $order = Order::create([
                'user_id' => null, // POS orders might be guest or we could link to a generic customer if needed
                'guest_name' => $validated['guest_name'] ?? 'Walk-in Customer',
                'total_cents' => $totalCents,
                'status' => 'placed', // or 'preparing' immediately?
                'payment_method' => $validated['payment_method'],
                'assigned_to' => $request->user()->id, // Cashier who took the order
            ]);

            foreach ($orderItemsData as $data) {
                $order->items()->create($data);
            }

            DB::commit();

            return response()->json(['message' => 'Order created successfully', 'order_id' => $order->id], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create order', 'error' => $e->getMessage()], 500);
        }
    }
}
