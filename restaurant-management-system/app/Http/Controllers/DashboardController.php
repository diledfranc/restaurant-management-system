<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        // $roles = $user->roles->pluck('name'); 

        // If not manager/admin, just return basic dashboard
        if (!$user->hasRole(['manager', 'admin'])) {
            return Inertia::render('dashboard');
        }

        // 1. Live Orders Overview (All orders for the board)
        // We fetch recent orders to populate the board.
        $orders = Order::with(['user', 'items.menuItem', 'assignedStaff'])
            ->whereDate('created_at', '>=', Carbon::now()->subDays(1)) // Last 24 hours for "Live" feel, or just active
            ->whereIn('status', ['placed', 'preparing', 'on_way'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => 'ORD-' . str_pad($order->id, 5, '0', STR_PAD_LEFT),
                    'status' => match($order->status) {
                        'placed' => 'pending',
                        'on_way' => 'out_for_delivery',
                        default => $order->status,
                    },
                    'total_amount' => $order->total_cents / 100,
                    'table_number' => null,
                    'created_at' => $order->created_at->toIso8601String(),
                    'items_count' => $order->items->sum('quantity'),
                    'customer_name' => $order->guest_name ?? $order->user->name ?? 'Guest',
                    'type' => 'Delivery',
                ];
            });

        // 2. Stats Today
        $today = Carbon::today();
        $salesToday = Order::whereDate('created_at', $today)
            ->where('status', '!=', 'cancelled')
            ->sum('total_cents');
        
        $ordersCountToday = Order::whereDate('created_at', $today)->count();
        $avgOrderValue = $ordersCountToday > 0 ? $salesToday / $ordersCountToday : 0;

        // 3. Best Selling Items (All time or this month)
        $bestSelling = OrderItem::select('menu_item_id', DB::raw('sum(quantity) as total_qty'))
            ->with('menuItem')
            ->groupBy('menu_item_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->menuItem->name ?? 'Unknown Item',
                    'total_sold' => $item->total_qty,
                ];
            });

        // 4. Low Selling Items
        $lowSelling = OrderItem::select('menu_item_id', DB::raw('sum(quantity) as total_qty'))
            ->with('menuItem')
            ->groupBy('menu_item_id')
            ->orderBy('total_qty', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->menuItem->name ?? 'Unknown Item',
                    'total_sold' => $item->total_qty,
                ];
            });

        // 5. Sales Chart (Last 7 days)
        $salesChart = Order::select(DB::raw('DATE(created_at) as date'), DB::raw('sum(total_cents) as total'))
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->where('status', '!=', 'cancelled')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total' => $item->total / 100,
                ];
            });

        // 6. Category Sales (Pie Chart)
        $categorySales = DB::table('order_items')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('menu_categories', 'menu_items.category_id', '=', 'menu_categories.id')
            ->select('menu_categories.name', DB::raw('sum(order_items.quantity * order_items.price_cents) as total'))
            ->groupBy('menu_categories.name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'total' => $item->total / 100,
                ];
            });

        return Inertia::render('dashboard', [
            'orders' => $orders,
            'stats' => [
                'total_sales' => $salesToday / 100,
                'total_orders' => $ordersCountToday,
                'avg_order_value' => $avgOrderValue / 100,
            ],
            'best_selling' => $bestSelling,
            'low_selling' => $lowSelling,
            'sales_chart' => $salesChart,
            'category_sales' => $categorySales,
        ]);
    }
}
