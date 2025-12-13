<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::query();

        // Filter by date (default to today/future)
        if ($request->has('date')) {
            $query->whereDate('reservation_time', $request->date);
        } else {
            $query->whereDate('reservation_time', '>=', Carbon::today());
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $reservations = $query->orderBy('reservation_time', 'asc')->get();

        return Inertia::render('reservations/index', [
            'reservations' => $reservations,
            'filters' => $request->only(['date', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:20',
            'guest_email' => 'nullable|email',
            'party_size' => 'required|integer|min:1',
            'reservation_time' => 'required|date|after:now',
            'notes' => 'nullable|string',
        ]);

        Reservation::create($validated);

        return redirect()->back()->with('success', 'Reservation created successfully.');
    }

    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,seated,cancelled,completed',
            'table_number' => 'nullable|string',
        ]);

        $reservation->update($validated);

        return redirect()->back()->with('success', 'Reservation updated.');
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->delete();
        return redirect()->back()->with('success', 'Reservation deleted.');
    }
}
