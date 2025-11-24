<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
