<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \App\Models\Ingredient::observe(\App\Observers\IngredientObserver::class);

        RedirectIfAuthenticated::redirectUsing(function () {
            $user = Auth::user();
            if ($user) {
                if ($user->hasRole('kitchen')) {
                    return route('kitchen.index');
                }
                if ($user->hasRole('admin') || $user->hasRole('manager') || $user->hasRole('staff') || $user->hasRole('cashier')) {
                    return route('dashboard');
                }
            }
            return route('shop.menu');
        });
    }
}
