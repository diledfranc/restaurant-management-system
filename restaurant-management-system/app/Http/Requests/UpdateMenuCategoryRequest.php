<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => 'sometimes|string|max:255',
            'slug'        => 'sometimes|string|unique:menu_categories,slug,' . $this->category->id,
            'parent_id'   => 'nullable|exists:menu_categories,id',
            'description' => 'nullable|string'
        ];
    }
}
