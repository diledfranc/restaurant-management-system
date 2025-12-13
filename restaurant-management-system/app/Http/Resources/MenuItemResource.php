<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'price_cents' => $this->price_cents,
            'cost_cents'  => $this->cost_cents,
            'profit_margin_percent' => $this->price_cents > 0 
                ? round((($this->price_cents - $this->cost_cents) / $this->price_cents) * 100, 2) 
                : 0,
            'is_available'=> $this->is_available,
            'image_url'   => $this->image_path ? \Illuminate\Support\Facades\Storage::url($this->image_path) : null,
            'category'    => $this->category?->name,
            'category_id' => $this->category_id,
            'modifier_groups' => $this->whenLoaded('modifierGroups'),
            'ingredients' => $this->whenLoaded('ingredients', function () {
                return $this->ingredients->map(function ($ingredient) {
                    return [
                        'id' => $ingredient->id,
                        'name' => $ingredient->name,
                        'unit' => $ingredient->unit,
                        'quantity' => $ingredient->pivot->quantity,
                    ];
                });
            }),
            'created_at'  => $this->created_at,
        ];
    }
}
