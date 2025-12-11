<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with('category');

        if ($request->filled('category')) {
            $category = $request->category;
            // Check if it's an ID or Name
            if (is_numeric($category)) {
                $query->where('category_id', $category);
            } else {
                $query->whereHas('category', function ($q) use ($category) {
                    $q->where('name', $category);
                });
            }
        }

        $items = $query->paginate(12)->withQueryString();

        if ($request->wantsJson() || $request->is('api/*')) {
            return MenuItemResource::collection($items);
        }

        $categories = \App\Models\MenuCategory::all();

        return Inertia::render('menu/index', [
            'items' => MenuItemResource::collection($items)->response()->getData(true),
            'categories' => $categories,
            'filters' => $request->only(['category']),
        ]);
    }

    public function store(StoreMenuItemRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('menu', 'public');
        }

        $item = MenuItem::create($data);

        return new MenuItemResource($item);
    }

    public function show(MenuItem $menuItem)
    {
        return new MenuItemResource($menuItem->load('category'));
    }

    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('menu', 'public');
        }

        $menuItem->update($data);

        return new MenuItemResource($menuItem);
    }

    public function destroy(MenuItem $menuItem)
    {
        \Log::info('Attempting to delete menu item', ['id' => $menuItem->id, 'user_id' => auth()->id()]);
        try {
            $this->authorize('delete', $menuItem);
        } catch (\Exception $e) {
            \Log::error('Authorization failed for menu item delete', ['error' => $e->getMessage(), 'user_id' => auth()->id()]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $menuItem->delete();
            \Log::info('Menu item deleted', ['id' => $menuItem->id]);
            return response()->json(['message' => 'Menu item deleted']);
        } catch (\Exception $e) {
            \Log::error('Delete failed', ['error' => $e->getMessage(), 'id' => $menuItem->id]);
            return response()->json(['error' => 'Delete failed', 'details' => $e->getMessage()], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:menu_items,id',
        ]);

        $ids = $request->ids;
        \Log::info('Attempting to bulk delete menu items', ['ids' => $ids, 'user_id' => auth()->id()]);

        // Check authorization for at least one item (or all if strict)
        // Assuming if they can delete one, they can delete others, or check role
        if (!auth()->user()->hasRole('manager') && !auth()->user()->hasRole('admin')) {
             return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            MenuItem::whereIn('id', $ids)->delete();
            \Log::info('Menu items bulk deleted', ['ids' => $ids]);
            return response()->json(['message' => 'Menu items deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Bulk delete failed', ['error' => $e->getMessage(), 'ids' => $ids]);
            return response()->json(['error' => 'Delete failed', 'details' => $e->getMessage()], 500);
        }
    }
}
