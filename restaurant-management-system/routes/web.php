<?php

use App\Http\Controllers\MenuItemController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Management pages
    Route::get('/menu', [MenuItemController::class, 'index'])->name('menu.index');
    Route::get('/orders', function () {
        return Inertia::render('orders/index');
    })->name('orders.index');
    Route::get('/reports', function () {
        return Inertia::render('reports/index');
    })->name('reports.index');
    Route::get('/delivery', function () {
        return Inertia::render('delivery/index');
    })->name('delivery.index');
    Route::get('/staff', function () {
        return Inertia::render('staff/index');
    })->name('staff.index');
    Route::get('/reservations', function () {
        return Inertia::render('reservations/index');
    })->name('reservations.index');
});

require __DIR__.'/settings.php';
