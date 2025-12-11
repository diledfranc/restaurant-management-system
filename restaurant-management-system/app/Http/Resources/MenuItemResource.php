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
            'is_available'=> $this->is_available,
            'image_url'   => $this->image_path ? \Illuminate\Support\Facades\Storage::url($this->image_path) : null,
            'category'    => $this->category?->name,
            'category_id' => $this->category_id,
            'created_at'  => $this->created_at,
        ];
    }
}
