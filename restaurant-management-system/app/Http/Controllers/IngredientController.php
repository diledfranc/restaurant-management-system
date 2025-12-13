<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Services\InventoryService;

class IngredientController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index()
    {
        $ingredients = Ingredient::with(['batches' => function($q) {
            $q->where('quantity', '>', 0)->orderBy('expiration_date');
        }])->orderBy('name')->get();

        return Inertia::render('admin/inventory/index', [
            'ingredients' => $ingredients,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'cost_per_unit_cents' => 'required|integer|min:0',
        ]);

        Ingredient::create($validated);

        return redirect()->back()->with('success', 'Ingredient created.');
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'current_stock' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'cost_per_unit_cents' => 'required|integer|min:0',
        ]);

        $ingredient->update($validated);

        return redirect()->back()->with('success', 'Ingredient updated.');
    }

    public function destroy(Ingredient $ingredient)
    {
        $ingredient->delete();

        return redirect()->back()->with('success', 'Ingredient deleted.');
    }

    public function receive(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'cost_per_unit_cents' => 'required|integer|min:0',
            'expiration_date' => 'nullable|date',
            'batch_number' => 'nullable|string|max:255',
        ]);

        $this->inventoryService->receiveStock(
            $ingredient,
            $validated['quantity'],
            $validated['cost_per_unit_cents'],
            $validated['expiration_date'] ?? null,
            $validated['batch_number'] ?? null
        );

        return redirect()->back()->with('success', 'Stock received successfully.');
    }

    public function waste(Request $request, Ingredient $ingredient)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'ingredient_batch_id' => 'nullable|exists:ingredient_batches,id',
        ]);

        $this->inventoryService->logWaste(
            $ingredient,
            $validated['quantity'],
            $validated['reason'],
            $request->user()->id,
            $validated['notes'] ?? null,
            $validated['ingredient_batch_id'] ?? null
        );

        return redirect()->back()->with('success', 'Waste logged successfully.');
    }
}
