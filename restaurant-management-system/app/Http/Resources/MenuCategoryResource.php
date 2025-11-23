<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuCategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'parent'      => $this->parent?->name,
            'children'    => MenuCategoryResource::collection($this->whenLoaded('children')),
            'created_at'  => $this->created_at,
        ];
    }
}
