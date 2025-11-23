<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use App\Models\MenuCategory;

class UpdateMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $category = $this->route('category');
        return Gate::forUser($this->user())->allows('update', $category ?? MenuCategory::class);
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
