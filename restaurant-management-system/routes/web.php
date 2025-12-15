<?php

use Illuminate\Support\Facades\Artisan;

Route::get('/seed-cafe-menu', function () {
    try {
        Artisan::call('db:seed', ['--class' => 'CafeMenuSeeder', '--force' => true]);
        return 'Cafe Menu Seeded Successfully!';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\DashboardController;
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

$authMiddleware = ['auth'];
if (config('fortify.require_email_verification')) {
    $authMiddleware[] = 'verified';
}

Route::middleware($authMiddleware)->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Customer-specific pages (all authenticated users)
    Route::get('/customer/orders', function () {
        return Inertia::render('customer/orders');
    })->name('customer.orders');

    // Payment Routes
    Route::post('/checkout/session', [App\Http\Controllers\PaymentController::class, 'checkout'])->name('checkout.session');
    Route::get('/payment/success', [App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
    Route::get('/payment/cancel', [App\Http\Controllers\PaymentController::class, 'cancel'])->name('payment.cancel');

    // Manager & Staff Operations
    Route::middleware(['role:manager,staff,admin'])->group(function () {
        Route::get('/menu', [MenuItemController::class, 'index'])->name('menu.index');
        
        // Modifiers
        Route::get('/modifiers', [App\Http\Controllers\ModifierGroupController::class, 'index'])->name('modifiers.index');
        Route::post('/modifiers', [App\Http\Controllers\ModifierGroupController::class, 'store'])->name('modifiers.store');
        Route::put('/modifiers/{modifierGroup}', [App\Http\Controllers\ModifierGroupController::class, 'update'])->name('modifiers.update');
        Route::delete('/modifiers/{modifierGroup}', [App\Http\Controllers\ModifierGroupController::class, 'destroy'])->name('modifiers.destroy');
        
        Route::post('/modifiers/{modifierGroup}/items', [App\Http\Controllers\ModifierGroupController::class, 'storeModifier'])->name('modifiers.items.store');
        Route::put('/modifiers/{modifierGroup}/items/{modifier}', [App\Http\Controllers\ModifierGroupController::class, 'updateModifier'])->name('modifiers.items.update');
        Route::delete('/modifiers/{modifierGroup}/items/{modifier}', [App\Http\Controllers\ModifierGroupController::class, 'destroyModifier'])->name('modifiers.items.destroy');

        // Inventory
        Route::get('/inventory', [App\Http\Controllers\IngredientController::class, 'index'])->name('inventory.index');
        Route::post('/inventory', [App\Http\Controllers\IngredientController::class, 'store'])->name('inventory.store');
        Route::put('/inventory/{ingredient}', [App\Http\Controllers\IngredientController::class, 'update'])->name('inventory.update');
        Route::delete('/inventory/{ingredient}', [App\Http\Controllers\IngredientController::class, 'destroy'])->name('inventory.destroy');
        Route::post('/inventory/{ingredient}/receive', [App\Http\Controllers\IngredientController::class, 'receive'])->name('inventory.receive');
        Route::post('/inventory/{ingredient}/waste', [App\Http\Controllers\IngredientController::class, 'waste'])->name('inventory.waste');

        Route::get('/orders', [OrderController::class, 'pageIndex'])->name('orders.index');
        Route::get('/reports', [ReportController::class, 'pageIndex'])->name('reports.index');
        Route::get('/delivery', [DeliveryController::class, 'pageIndex'])->name('delivery.index');
        
        // Reservations
        Route::get('/reservations', [App\Http\Controllers\ReservationController::class, 'index'])->name('reservations.index');
        Route::post('/reservations', [App\Http\Controllers\ReservationController::class, 'store'])->name('reservations.store');
        Route::put('/reservations/{reservation}', [App\Http\Controllers\ReservationController::class, 'update'])->name('reservations.update');
        Route::delete('/reservations/{reservation}', [App\Http\Controllers\ReservationController::class, 'destroy'])->name('reservations.destroy');

        // Tables
        Route::get('/tables', [App\Http\Controllers\TableController::class, 'index'])->name('tables.index');
        Route::post('/tables', [App\Http\Controllers\TableController::class, 'store'])->name('tables.store');
        Route::put('/tables/{table}', [App\Http\Controllers\TableController::class, 'update'])->name('tables.update');
        Route::patch('/tables/{table}/position', [App\Http\Controllers\TableController::class, 'updatePosition'])->name('tables.position');
        Route::delete('/tables/{table}', [App\Http\Controllers\TableController::class, 'destroy'])->name('tables.destroy');
    });

    // POS & Kitchen
    Route::middleware(['role:staff,cashier,manager,admin'])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('/pos/orders', [PosController::class, 'store'])->name('pos.store');
    });

    Route::middleware(['role:kitchen,manager,admin'])->group(function () {
        Route::get('/kitchen', [KitchenController::class, 'index'])->name('kitchen.index');
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
