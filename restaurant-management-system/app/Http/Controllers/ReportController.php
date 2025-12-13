<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
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

        $summary = [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'total_cents' => (int) $salesRows->sum('total_cents'),
            'orders_count' => (int) $salesRows->sum('orders_count'),
        ];
        $summary['avg_order_cents'] = $summary['orders_count'] > 0
            ? (int) floor($summary['total_cents'] / $summary['orders_count'])
            : 0;

        return Inertia::render('reports/index', [
            'summary' => $summary,
            'sales' => $salesRows,
            'topSelling' => $topSellingRows,
            'lowSelling' => $lowSellingRows,
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
