<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use App\Models\Order;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Allow guests and authorized users to create orders per OrderPolicy::create
        return Gate::forUser($this->user())->allows('create', Order::class);
    }

    public function rules(): array
    {
        return [
            'cart' => 'required|array|min:1',
            'cart.*.menu_item_id' => 'required|exists:menu_items,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.notes' => 'nullable|string|max:500',
            'cart.*.modifiers' => 'nullable|array',
            'cart.*.modifiers.*.modifier_id' => 'required|exists:modifiers,id',
            'user_id' => 'nullable|exists:users,id',
            'guest_name' => 'required_without:user_id|string|max:191',
            'guest_phone' => ['required_without:user_id', 'string', 'regex:/^0[0-9]{9}$/'],
            'guest_address' => 'required_if:order_type,delivery|nullable|string|max:1000',
            'payment_method' => 'required|in:cash,transfer,card,online',
            'order_type' => 'required|in:delivery,pickup,dine_in',
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

