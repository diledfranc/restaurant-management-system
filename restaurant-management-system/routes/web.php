<?php

use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SettingController;
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

Route::get('/cart', function () {
    return Inertia::render('customer/cart');
})->name('shop.cart');

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

    // Manager & Staff Operations
    Route::middleware(['role:manager,staff'])->group(function () {
        Route::get('/menu', [MenuItemController::class, 'index'])->name('menu.index');
        Route::get('/orders', [OrderController::class, 'pageIndex'])->name('orders.index');
        Route::get('/reports', [ReportController::class, 'pageIndex'])->name('reports.index');
        Route::get('/delivery', [DeliveryController::class, 'pageIndex'])->name('delivery.index');
        Route::get('/reservations', function () {
            return Inertia::render('reservations/index');
        })->name('reservations.index');
    });

    // Admin Management
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::put('/staff/{user}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{user}', [StaffController::class, 'destroy'])->name('staff.destroy');

        Route::get('/logs', [ActivityLogController::class, 'index'])->name('logs.index');

        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    });
});

require __DIR__.'/settings.php';
