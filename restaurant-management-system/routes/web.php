<?php

use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public customer shop
Route::get('/shop', function () {
    return Inertia::render('customer/menu');
})->name('shop.menu');

Route::get('/shop/checkout', function () {
    return Inertia::render('customer/checkout');
})->name('shop.checkout');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Customer-specific pages (all authenticated users)
    Route::get('/customer/orders', function () {
        return Inertia::render('customer/orders');
    })->name('customer.orders');

    // Management pages - accessible by manager, staff, and admin
    Route::middleware(['role:admin,manager,staff'])->group(function () {
        Route::get('/menu', [MenuItemController::class, 'index'])->name('menu.index');
        Route::get('/orders', [OrderController::class, 'pageIndex'])->name('orders.index');
        Route::get('/reports', [ReportController::class, 'pageIndex'])->name('reports.index');
        Route::get('/delivery', [DeliveryController::class, 'pageIndex'])->name('delivery.index');
        Route::get('/reservations', function () {
            return Inertia::render('reservations/index');
        })->name('reservations.index');
    });

    // Staff management - admin only
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/staff', function () {
            return Inertia::render('staff/index');
        })->name('staff.index');
    });
});

require __DIR__.'/settings.php';
