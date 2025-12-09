<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');

        return Inertia::render('admin/settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'restaurant_name' => 'nullable|string|max:255',
            'operating_hours' => 'nullable|string|max:255',
            'offline_message' => 'nullable|string|max:255',
            'max_delivery_radius' => 'nullable|numeric',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
