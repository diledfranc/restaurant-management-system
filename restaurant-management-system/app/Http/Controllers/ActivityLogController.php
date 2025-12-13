<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        $logs = ActivityLog::with('user')
            ->latest()
            ->paginate(20)
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : 'System',
                    'action' => $log->action_type, // Using existing column name
                    'description' => $log->payload ? json_encode($log->payload) : '',
                    'ip_address' => $log->ip,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('admin/logs', [
            'logs' => $logs,
        ]);
    }
}
