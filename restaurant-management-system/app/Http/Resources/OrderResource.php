<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', function () {
                return $this->user ? [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'phone' => $this->user->phone,
                ] : null;
            }),
            'guest_name' => $this->guest_name,
            'table_number' => $this->table_number,
            'guest_phone' => $this->guest_phone,
            'guest_address' => $this->guest_address,
            'total_cents' => $this->total_cents,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'assigned_to' => $this->whenLoaded('assignedStaff', function () {
                return $this->assignedStaff ? [
                    'id' => $this->assignedStaff->id,
                    'name' => $this->assignedStaff->name,
                ] : null;
            }),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
