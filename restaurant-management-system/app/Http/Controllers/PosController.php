<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Modifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\InventoryService;

class PosController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index()
    {
        // Eager load modifier groups and modifiers for the POS
        $categories = MenuCategory::with(['items' => function ($query) {
            $query->where('is_available', true)
                  ->with(['modifierGroups.modifiers' => function($q) {
                      $q->where('is_available', true);
                  }]);
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
            'items.*.modifiers' => 'nullable|array',
            'items.*.modifiers.*.modifier_id' => 'required|exists:modifiers,id',
            'payment_method' => 'required|string', // cash, card
            'guest_name' => 'nullable|string',
            'table_number' => 'nullable|string', // if applicable
        ]);

        DB::beginTransaction();
        try {
            $totalCents = 0;
            $orderItemsToCreate = [];

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::find($itemData['id']);
                $qty = $itemData['quantity'];
                $itemPrice = $menuItem->price_cents;
                
                $modifiersTotal = 0;
                $modifiersCost = 0;
                $modifierAttachments = [];

                if (isset($itemData['modifiers']) && is_array($itemData['modifiers'])) {
                    foreach ($itemData['modifiers'] as $modData) {
                        $mod = Modifier::find($modData['modifier_id']);
                        if ($mod) {
                            $modifiersTotal += $mod->price_cents;
                            $modifiersCost += $mod->cost_cents;
                            $modifierAttachments[$mod->id] = [
                                'modifier_name' => $mod->name,
                                'price_cents' => $mod->price_cents
                            ];
                        }
                    }
                }

                $effectiveUnitPrice = $itemPrice + $modifiersTotal;
                $lineTotal = $effectiveUnitPrice * $qty;
                $totalCents += $lineTotal;
                
                // Calculate total cost for this line item
                $totalCost = ($menuItem->cost_cents + $modifiersCost) * $qty;

                $orderItemsToCreate[] = [
                    'menu_item' => $menuItem,
                    'data' => [
                        'menu_item_id' => $menuItem->id,
                        'quantity' => $qty,
                        'unit_price_cents' => $effectiveUnitPrice,
                        'total_price_cents' => $lineTotal,
                        'cost_cents' => $totalCost,
                        'notes' => $itemData['notes'] ?? null,
                    ],
                    'modifiers' => $modifierAttachments,
                    'raw_modifiers' => $itemData['modifiers'] ?? []
                ];
            }

            $order = Order::create([
                'user_id' => null, 
                'guest_name' => $validated['guest_name'] ?? 'Walk-in Customer',
                'total_cents' => $totalCents,
                'status' => 'placed',
                'payment_method' => $validated['payment_method'],
                'assigned_to' => $request->user()->id,
            ]);

            foreach ($orderItemsToCreate as $item) {
                $orderItem = $order->items()->create($item['data']);
                
                if (!empty($item['modifiers'])) {
                    $orderItem->modifiers()->attach($item['modifiers']);
                }

                // Deduct stock for Menu Item
                $menuItem = $item['menu_item'];
                $menuItem->load('ingredients');
                foreach ($menuItem->ingredients as $ingredient) {
                    $quantityToDeduct = $ingredient->pivot->quantity * $item['data']['quantity'];
                    $this->inventoryService->consumeStock($ingredient, $quantityToDeduct);
                }

                // Deduct stock for Modifiers
                if (isset($item['raw_modifiers']) && is_array($item['raw_modifiers'])) {
                    foreach ($item['raw_modifiers'] as $modData) {
                        $mod = Modifier::find($modData['modifier_id']);
                        if ($mod) {
                            $mod->load('ingredients');
                            foreach ($mod->ingredients as $modIngredient) {
                                $quantityToDeduct = $modIngredient->pivot->quantity * $item['data']['quantity'];
                                $this->inventoryService->consumeStock($modIngredient, $quantityToDeduct);
                            }
                        }
                    }
                }
            }

            DB::commit();

            return response()->json(['message' => 'Order created successfully', 'order_id' => $order->id], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create order', 'error' => $e->getMessage()], 500);
        }
    }
}
