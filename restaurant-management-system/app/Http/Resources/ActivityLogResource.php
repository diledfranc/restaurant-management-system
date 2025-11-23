<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', function() {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),
            'action_type' => $this->action_type,
            'model_type' => $this->model_type,
            'model_id' => $this->model_id,
            'payload' => $this->payload,
            'ip' => $this->ip,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
