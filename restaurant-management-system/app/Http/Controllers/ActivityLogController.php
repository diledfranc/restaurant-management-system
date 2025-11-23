<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        // only manager/admin view logs
        if (!in_array($request->user()->role->name, ['manager','admin'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $q = ActivityLog::with('user')->orderBy('created_at', 'desc')->paginate(25);

        return ActivityLogResource::collection($q);
    }
}
