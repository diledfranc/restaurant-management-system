<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'order' => $this->whenLoaded('order', function () {
                return [
                    'id' => $this->order->id,
                    'status' => $this->order->status,
                    'total_cents' => $this->order->total_cents,
                    'guest_name' => $this->order->guest_name ?? $this->order->user->name ?? 'Guest',
                    'guest_phone' => $this->order->guest_phone ?? $this->order->user->phone ?? '-',
                    'guest_address' => $this->order->guest_address ?? 'No address provided',
                ];
            }),
            'assigned_user' => $this->whenLoaded('staff', function () {
                return [
                    'id' => $this->staff?->id,
                    'name' => $this->staff?->name,
                ];
            }),
            'status' => $this->status,
            'pickup_time' => $this->pickup_time,
            'delivered_time' => $this->delivered_time,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
