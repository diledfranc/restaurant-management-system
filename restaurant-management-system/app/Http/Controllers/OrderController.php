<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    // List orders (filterable)
    public function index(Request $request)
    {
        $query = Order::with(['items.menuItem','user','assignedStaff']);

        // filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // if staff -> only their assigned orders
        if ($request->user() && $request->user()->role->name === 'staff') {
            $query->where('assigned_to', $request->user()->id);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return OrderResource::collection($orders);
    }

    // Inertia page for management UI
    public function pageIndex(Request $request)
    {
        $query = Order::with(['items.menuItem','user','assignedStaff']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Limit staff to their assigned orders
        if ($request->user() && $request->user()->role->name === 'staff') {
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
                $unit = $mi->price_cents;
                $total += $unit * $qty;
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

            // create order items
            foreach ($data['cart'] as $c) {
                $mi = MenuItem::findOrFail($c['menu_item_id']);
                $qty = intval($c['quantity']);
                $unit = $mi->price_cents;
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $mi->id,
                    'quantity' => $qty,
                    'unit_price_cents' => $unit,
                    'total_price_cents' => $unit * $qty,
                    'notes' => $c['notes'] ?? null,
                ]);
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

            return (new OrderResource($order->load('items.menuItem','user')))->response()->setStatusCode(201);
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
