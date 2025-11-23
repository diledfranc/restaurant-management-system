<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use App\Models\MenuItem;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::forUser($this->user())->allows('create', MenuItem::class);
    }

    public function rules(): array
    {
        return [
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'category_id'  => 'required|exists:menu_categories,id',
            'price_cents'  => 'required|integer|min:1',
            'is_available' => 'boolean',
            'image'        => 'nullable|image|max:2048',
        ];
    }
}
