<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'category_id'  => 'sometimes|exists:menu_categories,id',
            'price_cents'  => 'sometimes|integer|min:1',
            'is_available' => 'boolean',
            'image'        => 'nullable|image|max:2048',
        ];
    }
}
