<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Http\Requests\StoreMenuCategoryRequest;
use App\Http\Requests\UpdateMenuCategoryRequest;
use App\Http\Resources\MenuCategoryResource;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('all')) {
            return MenuCategoryResource::collection(MenuCategory::all());
        }
        
        return MenuCategoryResource::collection(
            MenuCategory::with('children')->paginate(10)
        );
    }

    public function store(StoreMenuCategoryRequest $request)
    {
        $category = MenuCategory::create($request->validated());

        return new MenuCategoryResource($category);
    }

    public function show(MenuCategory $category)
    {
        return new MenuCategoryResource($category->load('children'));
    }

    public function update(UpdateMenuCategoryRequest $request, MenuCategory $category)
    {
        $category->update($request->validated());

        return new MenuCategoryResource($category);
    }

    public function destroy(MenuCategory $category)
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }
}
