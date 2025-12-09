<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuCategoryController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

// Public auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

// Menu categories & items (public read)
Route::get('/menu', [MenuItemController::class, 'index']); // combined listing
Route::get('/menu/{menuItem}', [MenuItemController::class, 'show']);
Route::get('/categories', [MenuCategoryController::class, 'index']);
Route::get('/categories/{category}', [MenuCategoryController::class, 'show']);

// Legacy-compatible endpoints
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}', [MenuItemController::class, 'show']);
Route::get('/menu-categories', [MenuCategoryController::class, 'index']);
Route::get('/menu-categories/{menuCategory}', [MenuCategoryController::class, 'show']);

// Protected routes for management actions — policies enforce manager/admin
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('categories', MenuCategoryController::class)->except(['index','show']);
    Route::apiResource('menu-items', MenuItemController::class)->except(['index','show']);
    Route::get('/reports/sales', [\App\Http\Controllers\ReportController::class, 'sales']);
    Route::get('/reports/low-selling', [\App\Http\Controllers\ReportController::class, 'lowSelling']);
});

// Orders
Route::post('/orders', [OrderController::class, 'store']); // guest allowed
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']); // staff/manager filtered by role
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/assign', [OrderController::class, 'assignStaff']); // manager/admin
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    
    // Customer-specific: view their own orders
    Route::get('/customer/orders', [OrderController::class, 'customerOrders']);
});

// Deliveries
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/deliveries', [DeliveryController::class, 'index']);
    Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show']);
    Route::post('/deliveries/{delivery}/assign', [DeliveryController::class, 'assign']);
    Route::patch('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);
});

// Activity logs (policies enforce manager/admin)
Route::middleware(['auth:sanctum'])->get('/activity-logs', [ActivityLogController::class, 'index']);
