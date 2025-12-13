<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'menu_item' => $this->menuItem ? [
                'id' => $this->menuItem->id,
                'name' => $this->menuItem->name,
                'price_cents' => $this->menuItem->price_cents,
            ] : [
                'id' => 0,
                'name' => 'Unknown Item (Deleted)',
                'price_cents' => 0,
            ],
            'quantity' => $this->quantity,
            'unit_price_cents' => $this->unit_price_cents,
            'total_price_cents' => $this->total_price_cents,
            'notes' => $this->notes,
            'modifiers' => $this->modifiers->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'name' => $mod->pivot->modifier_name,
                    'price_cents' => $mod->pivot->price_cents,
                ];
            }),
        ];
    }
}
