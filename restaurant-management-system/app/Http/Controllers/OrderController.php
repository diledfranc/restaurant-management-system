<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Delivery;
use App\Models\MenuItem;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Services\InventoryService;

class OrderController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    // List orders (filterable)
    public function index(Request $request)
    {
        $query = Order::with(['items.menuItem', 'items.modifiers', 'user', 'assignedStaff']);

        // filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // if staff -> only their assigned orders
        if ($request->user() && $request->user()->role?->name === 'staff') {
            $query->where('assigned_to', $request->user()->id);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return OrderResource::collection($orders);
    }

    // Inertia page for management UI
    public function pageIndex(Request $request)
    {
        $query = Order::with(['items.menuItem', 'items.modifiers', 'user', 'assignedStaff']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Limit staff to their assigned orders
        if ($request->user() && $request->user()->role?->name === 'staff') {
            $query->where('assigned_to', $request->user()->id);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('orders/index', [
            'orders' => OrderResource::collection($orders)->response()->getData(true),
            'filters' => [
                'status' => $request->status,
                'assigned_to' => $request->assigned_to,
            ],
        ]);
    }

    // Create order (guest or user)
    public function store(StoreOrderRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();

        DB::beginTransaction();
        try {
            // calculate total and create order
            $total = 0;
            foreach ($data['cart'] as $c) {
                $mi = MenuItem::findOrFail($c['menu_item_id']);
                $qty = intval($c['quantity']);
                $itemPrice = $mi->price_cents;
                
                $modifiersTotal = 0;
                if (isset($c['modifiers']) && is_array($c['modifiers'])) {
                    foreach ($c['modifiers'] as $modData) {
                        $mod = \App\Models\Modifier::find($modData['modifier_id']);
                        if ($mod) {
                            $modifiersTotal += $mod->price_cents;
                        }
                    }
                }
                
                $total += ($itemPrice + $modifiersTotal) * $qty;
            }

            $order = Order::create([
                'user_id' => $data['user_id'] ?? ($user?->id),
                'guest_name' => $data['guest_name'] ?? null,
                'guest_phone' => $data['guest_phone'],
                'guest_address' => $data['guest_address'],
                'total_cents' => $total,
                'payment_method' => $data['payment_method'],
                'status' => 'placed',
            ]);

            // Auto-create delivery record if address is provided
            if (!empty($data['guest_address'])) {
                Delivery::create([
                    'order_id' => $order->id,
                    'status' => 'pending',
                ]);
            }

            // create order items
            foreach ($data['cart'] as $c) {
                $mi = MenuItem::findOrFail($c['menu_item_id']);
                $qty = intval($c['quantity']);
                $itemPrice = $mi->price_cents;
                
                $modifiersTotal = 0;
                $modifiersCost = 0;
                $modifierAttachments = [];
                
                if (isset($c['modifiers']) && is_array($c['modifiers'])) {
                    foreach ($c['modifiers'] as $modData) {
                        $mod = \App\Models\Modifier::find($modData['modifier_id']);
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
                $totalCost = ($mi->cost_cents + $modifiersCost) * $qty;

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $mi->id,
                    'quantity' => $qty,
                    'unit_price_cents' => $effectiveUnitPrice,
                    'total_price_cents' => $effectiveUnitPrice * $qty,
                    'cost_cents' => $totalCost,
                    'notes' => $c['notes'] ?? null,
                ]);
                
                if (!empty($modifierAttachments)) {
                    $orderItem->modifiers()->attach($modifierAttachments);
                }

                // Deduct stock for Menu Item
                $mi->load('ingredients');
                foreach ($mi->ingredients as $ingredient) {
                    $quantityToDeduct = $ingredient->pivot->quantity * $qty;
                    $this->inventoryService->consumeStock($ingredient, $quantityToDeduct);
                }

                // Deduct stock for Modifiers
                if (isset($c['modifiers']) && is_array($c['modifiers'])) {
                    foreach ($c['modifiers'] as $modData) {
                        $mod = \App\Models\Modifier::find($modData['modifier_id']);
                        if ($mod) {
                            $mod->load('ingredients');
                            foreach ($mod->ingredients as $modIngredient) {
                                $quantityToDeduct = $modIngredient->pivot->quantity * $qty;
                                $this->inventoryService->consumeStock($modIngredient, $quantityToDeduct);
                            }
                        }
                    }
                }
            }

            // optional: dispatch notification job here (email/in-app)
            ActivityLog::create([
                'user_id' => $user?->id,
                'action_type' => 'order_created',
                'model_type' => 'order',
                'model_id' => $order->id,
                'payload' => json_encode(['total_cents' => $total]),
                'ip' => $request->ip(),
            ]);

            DB::commit();

            return (new OrderResource($order->load('items.menuItem', 'items.modifiers', 'user')))->response()->setStatusCode(201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // show single order
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return new OrderResource($order->load('items.menuItem','user','assignedStaff'));
    }

    // update order status
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $this->authorize('updateStatus', $order);

        $user = $request->user();

        $old = $order->status;
        $order->status = $request->status;
        $order->save();

        ActivityLog::create([
            'user_id' => $user->id,
            'action_type' => 'order_status_updated',
            'model_type' => 'order',
            'model_id' => $order->id,
            'payload' => json_encode(['from' => $old, 'to' => $order->status]),
            'ip' => $request->ip(),
        ]);

        // Optionally create/attach a delivery record when status moves to on_way
        if ($order->status === 'on_way') {
            $delivery = $order->delivery()->firstOrCreate([
                'order_id' => $order->id,
            ], [
                'assigned_user_id' => $order->assigned_to,
                'status' => 'on_route',
            ]);

            // notify customer
        }

        return new OrderResource($order->fresh()->load('items.menuItem','assignedStaff'));
    }

    // assign staff to order (manager action)
    public function assignStaff(Request $request, Order $order)
    {
        $this->authorize('assign', $order);
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $order->assigned_to = $request->assigned_to;
        $order->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'order_assigned',
            'model_type' => 'order',
            'model_id' => $order->id,
            'payload' => json_encode(['assigned_to' => $order->assigned_to]),
            'ip' => $request->ip(),
        ]);

        return new OrderResource($order->fresh()->load('assignedStaff'));
    }

    // Customer-specific: get their own orders
    public function customerOrders(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $orders = Order::with(['items.menuItem'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('guest_phone', $user->phone)
                      ->orWhere('guest_name', $user->name);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return OrderResource::collection($orders);
    }

    // delete order (soft-delete)
    public function destroy(Order $order)
    {

        $this->authorize('delete', $order);

        $user = request()->user();

        $order->delete();

        ActivityLog::create([
            'user_id' => $user->id,
            'action_type' => 'order_deleted',
            'model_type' => 'order',
            'model_id' => $order->id,
            'payload' => null,
            'ip' => request()->ip(),
        ]);

        return response()->json(['message' => 'Order deleted']);
    }
}
