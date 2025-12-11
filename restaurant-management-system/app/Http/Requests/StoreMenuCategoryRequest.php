<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use App\Models\MenuCategory;

class StoreMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::forUser($this->user())->allows('create', MenuCategory::class);
    }

    public function prepareForValidation()
    {
        if ($this->has('name') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->name),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'slug'        => 'required|string|unique:menu_categories,slug',
            'parent_id'   => 'nullable|exists:menu_categories,id',
            'description' => 'nullable|string'
        ];
    }
}
