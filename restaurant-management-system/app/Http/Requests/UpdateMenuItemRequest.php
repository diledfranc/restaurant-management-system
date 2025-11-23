<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use App\Models\MenuItem;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $item = $this->route('menu_item') ?? $this->route('menuItem');
        return Gate::forUser($this->user())->allows('update', $item ?? MenuItem::class);
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
