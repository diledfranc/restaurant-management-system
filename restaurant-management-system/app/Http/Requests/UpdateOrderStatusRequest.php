<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');
        return Gate::forUser($this->user())->allows('updateStatus', $order);
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:placed,preparing,on_way,delivered,cancelled'
        ];
    }
}
