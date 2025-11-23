<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'menu_item' => [
                'id' => $this->menuItem->id,
                'name' => $this->menuItem->name,
                'price_cents' => $this->menuItem->price_cents,
            ],
            'quantity' => $this->quantity,
            'unit_price_cents' => $this->unit_price_cents,
            'total_price_cents' => $this->total_price_cents,
            'notes' => $this->notes,
        ];
    }
}
