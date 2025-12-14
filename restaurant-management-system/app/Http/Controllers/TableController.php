<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        return Inertia::render('tables/index', [
            'tables' => Table::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required|unique:tables,table_number',
            'capacity' => 'required|integer|min:1',
            'shape' => 'required|in:square,round,rectangle',
        ]);

        Table::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'table_number' => 'required|unique:tables,table_number,' . $table->id,
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,reserved,dirty',
            'shape' => 'required|in:square,round,rectangle',
        ]);

        $table->update($validated);

        return redirect()->back();
    }

    public function updatePosition(Request $request, Table $table)
    {
        $validated = $request->validate([
            'position_x' => 'required|integer',
            'position_y' => 'required|integer',
        ]);

        $table->update($validated);

        return response()->json(['message' => 'Position updated']);
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return redirect()->back();
    }
}
