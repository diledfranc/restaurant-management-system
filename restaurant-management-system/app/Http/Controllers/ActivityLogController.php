<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        $q = ActivityLog::with('user')->orderBy('created_at', 'desc')->paginate(25);

        return ActivityLogResource::collection($q);
    }
}
