<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateDeliveryStatusRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    // list deliveries (manager/staff)
    public function index(Request $request)
    {
        $query = Delivery::with(['order','staff']);

        if ($request->user()->role->name === 'staff') {
            $query->where('assigned_user_id', $request->user()->id);
        }

        $deliveries = $query->orderBy('created_at', 'desc')->paginate(15);

        return DeliveryResource::collection($deliveries);
    }

    // show delivery
    public function show(Delivery $delivery)
    {
        $this->authorize('view', $delivery);

        return new DeliveryResource($delivery->load('order','staff'));
    }

    // manager assigns a delivery (or auto-created in order controller)
    public function assign(Request $request, Delivery $delivery)
    {
        $this->authorize('assign', $delivery);
        $request->validate([
            'assigned_user_id' => 'required|exists:users,id',
        ]);

        $delivery->assigned_user_id = $request->assigned_user_id;
        $delivery->status = 'assigned';
        $delivery->save();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'delivery_assigned',
            'model_type' => 'delivery',
            'model_id' => $delivery->id,
            'payload' => json_encode(['assigned_user_id' => $delivery->assigned_user_id]),
            'ip' => $request->ip(),
        ]);

        return new DeliveryResource($delivery->fresh());
    }

    // staff updates delivery status
    public function updateStatus(UpdateDeliveryStatusRequest $request, Delivery $delivery)
    {
        $this->authorize('updateStatus', $delivery);

        $user = $request->user();

        $old = $delivery->status;
        $delivery->status = $request->status;

        if ($request->status === 'picked_up') {
            $delivery->pickup_time = Carbon::now();
        }

        if ($request->status === 'delivered') {
            $delivery->delivered_time = Carbon::now();
            // update order status as well
            $delivery->order->status = 'delivered';
            $delivery->order->save();
        }

        $delivery->save();

        ActivityLog::create([
            'user_id' => $user->id,
            'action_type' => 'delivery_status_updated',
            'model_type' => 'delivery',
            'model_id' => $delivery->id,
            'payload' => json_encode(['from' => $old, 'to' => $delivery->status]),
            'ip' => $request->ip(),
        ]);

        return new DeliveryResource($delivery->fresh()->load('order','staff'));
    }
}
