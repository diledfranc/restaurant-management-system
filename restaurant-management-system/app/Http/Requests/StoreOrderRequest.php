<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Controller/policies will enforce role-based access if needed
    }

    public function rules(): array
    {
        return [
            'cart' => 'required|array|min:1',
            'cart.*.menu_item_id' => 'required|exists:menu_items,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.notes' => 'nullable|string|max:500',
            'user_id' => 'nullable|exists:users,id',
            'guest_name' => 'required_without:user_id|string|max:191',
            'guest_phone' => 'required_without:user_id|string|max:20',
            'guest_address' => 'required_without:user_id|string|max:1000',
            'payment_method' => 'required|in:cash,transfer',
        ];
    }

    public function messages(): array
    {
        return [
            'cart.required' => 'Cart must contain at least one item.',
            'guest_phone.required_without' => 'Phone number is required for guest checkout.',
            'guest_address.required_without' => 'Address is required for guest checkout.',
        ];
    }
}

