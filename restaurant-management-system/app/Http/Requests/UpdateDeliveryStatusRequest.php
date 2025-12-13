<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateDeliveryStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $delivery = $this->route('delivery');
        return Gate::forUser($this->user())->allows('updateStatus', $delivery);
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:pending,assigned,accepted,picked_up,on_route,delivered,cancelled'
        ];
    }
}
