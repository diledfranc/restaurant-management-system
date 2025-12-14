<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\WasteLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    // Sales totals grouped by day in cents
    public function sales(Request $request)
    {
        // Use ActivityLog policy to restrict reports to manager/admin
        $this->authorize('viewAny', \App\Models\ActivityLog::class);

        $from = $request->input('from') ? Carbon::parse($request->input('from')) : Carbon::now()->subDays(30);
        $to = $request->input('to') ? Carbon::parse($request->input('to')) : Carbon::now();

        $rows = Order::selectRaw("DATE(created_at) as day, SUM(total_cents) as total_cents, COUNT(*) as orders_count")
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->where('status', '!=', 'cancelled')
            ->groupBy('day')
            ->orderBy('day', 'asc')
            ->get();

        return response()->json(['from' => $from->toDateString(), 'to' => $to->toDateString(), 'data' => $rows]);
    }

    // Reports page (Inertia)
    public function pageIndex(Request $request)
    {
        $this->authorize('viewAny', \App\Models\ActivityLog::class);

        $from = $request->input('from') ? Carbon::parse($request->input('from')) : Carbon::now()->subDays(30);
        $to = $request->input('to') ? Carbon::parse($request->input('to')) : Carbon::now();

        $salesRows = Order::selectRaw("DATE(created_at) as day, SUM(total_cents) as total_cents, COUNT(*) as orders_count")
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->where('status', '!=', 'cancelled')
            ->groupBy('day')
            ->orderBy('day', 'asc')
            ->get();

        $costRows = OrderItem::selectRaw("DATE(orders.created_at) as day, SUM(order_items.cost_cents) as total_cost")
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$from->startOfDay(), $to->endOfDay()])
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        // Merge cost into sales rows
        $salesRows->transform(function ($row) use ($costRows) {
            $cost = $costRows->get($row->day)?->total_cost ?? 0;
            $row->total_cost = $cost;
            $row->gross_profit = $row->total_cents - $cost;
            return $row;
        });

        $topSellingRows = OrderItem::select('menu_item_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($q) use ($from, $to) {
                $q->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
                  ->where('status', '!=', 'cancelled');
            })
            ->groupBy('menu_item_id')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($r) {
                $item = MenuItem::find($r->menu_item_id);
                return [
                    'menu_item_id' => $r->menu_item_id,
                    'name' => $item?->name,
                    'total_sold' => (int) $r->total_sold,
                ];
            });

        $lowSellingRows = OrderItem::select('menu_item_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($q) use ($from, $to) {
                $q->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
                  ->where('status', '!=', 'cancelled');
            })
            ->groupBy('menu_item_id')
            ->orderBy('total_sold', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($r) {
                $item = MenuItem::find($r->menu_item_id);
                return [
                    'menu_item_id' => $r->menu_item_id,
                    'name' => $item?->name,
                    'total_sold' => (int) $r->total_sold,
                ];
            });

        // Waste Data
        $wasteRows = WasteLog::selectRaw("DATE(created_at) as day, SUM(loss_amount_cents) as total_loss")
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->groupBy('day')
            ->orderBy('day', 'asc')
            ->get();

        $topWastedIngredients = WasteLog::select('ingredient_id', DB::raw('SUM(loss_amount_cents) as total_loss'), DB::raw('SUM(quantity) as total_quantity'))
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->groupBy('ingredient_id')
            ->orderBy('total_loss', 'desc')
            ->limit(5)
            ->with('ingredient')
            ->get()
            ->map(function ($r) {
                return [
                    'ingredient_name' => $r->ingredient->name,
                    'unit' => $r->ingredient->unit,
                    'total_loss' => (int) $r->total_loss,
                    'total_quantity' => (float) $r->total_quantity,
                ];
            });

        $totalSales = (int) $salesRows->sum('total_cents');
        $totalCost = (int) $salesRows->sum('total_cost');
        $totalWaste = (int) $wasteRows->sum('total_loss');
        $grossProfit = (int) $salesRows->sum('gross_profit');

        $summary = [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'total_cents' => $totalSales,
            'total_cost' => $totalCost,
            'total_waste' => $totalWaste,
            'gross_profit' => $grossProfit,
            'net_profit_estimate' => $grossProfit - $totalWaste,
            'orders_count' => (int) $salesRows->sum('orders_count'),
        ];
        $summary['avg_order_cents'] = $summary['orders_count'] > 0
            ? (int) floor($summary['total_cents'] / $summary['orders_count'])
            : 0;
        $summary['profit_margin'] = $summary['total_cents'] > 0
            ? round(($summary['gross_profit'] / $summary['total_cents']) * 100, 2)
            : 0;

        return Inertia::render('reports/index', [
            'summary' => $summary,
            'sales' => $salesRows,
            'waste' => $wasteRows,
            'topSelling' => $topSellingRows,
            'lowSelling' => $lowSellingRows,
            'topWasted' => $topWastedIngredients,
        ]);
    }

    // Low-selling items by quantity sold (ascending) within the period
    public function lowSelling(Request $request)
    {
        // Use ActivityLog policy to restrict reports to manager/admin
        $this->authorize('viewAny', \App\Models\ActivityLog::class);

        $from = $request->input('from') ? Carbon::parse($request->input('from')) : Carbon::now()->subDays(30);
        $to = $request->input('to') ? Carbon::parse($request->input('to')) : Carbon::now();
        $limit = intval($request->input('limit', 10));

        $rows = OrderItem::select('menu_item_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($q) use ($from, $to) {
                $q->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
                  ->where('status', '!=', 'cancelled');
            })
            ->groupBy('menu_item_id')
            ->orderBy('total_sold', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($r) {
                $item = MenuItem::find($r->menu_item_id);
                return [
                    'menu_item_id' => $r->menu_item_id,
                    'name' => $item?->name,
                    'total_sold' => (int) $r->total_sold,
                ];
            });

        return response()->json(['from' => $from->toDateString(), 'to' => $to->toDateString(), 'data' => $rows]);
    }
}
