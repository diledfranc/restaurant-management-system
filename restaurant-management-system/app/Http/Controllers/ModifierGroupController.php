<?php

namespace App\Http\Controllers;

use App\Models\Modifier;
use App\Models\ModifierGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModifierGroupController extends Controller
{
    public function index()
    {
        $groups = ModifierGroup::with('modifiers')->orderBy('name')->get();

        return Inertia::render('admin/modifiers/index', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'internal_name' => 'nullable|string|max:255',
            'min_selection' => 'required|integer|min:0',
            'max_selection' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        ModifierGroup::create($validated);

        return redirect()->back()->with('success', 'Modifier group created.');
    }

    public function update(Request $request, ModifierGroup $modifierGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'internal_name' => 'nullable|string|max:255',
            'min_selection' => 'required|integer|min:0',
            'max_selection' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $modifierGroup->update($validated);

        return redirect()->back()->with('success', 'Modifier group updated.');
    }

    public function destroy(ModifierGroup $modifierGroup)
    {
        $modifierGroup->delete();

        return redirect()->back()->with('success', 'Modifier group deleted.');
    }

    // Modifier actions
    public function storeModifier(Request $request, ModifierGroup $modifierGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price_cents' => 'required|integer|min:0',
            'is_available' => 'boolean',
        ]);

        $modifierGroup->modifiers()->create($validated);

        return redirect()->back()->with('success', 'Modifier added.');
    }

    public function updateModifier(Request $request, ModifierGroup $modifierGroup, Modifier $modifier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price_cents' => 'required|integer|min:0',
            'is_available' => 'boolean',
        ]);

        $modifier->update($validated);

        return redirect()->back()->with('success', 'Modifier updated.');
    }

    public function destroyModifier(ModifierGroup $modifierGroup, Modifier $modifier)
    {
        $modifier->delete();

        return redirect()->back()->with('success', 'Modifier deleted.');
    }
}
