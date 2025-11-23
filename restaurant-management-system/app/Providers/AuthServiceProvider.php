<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Order;
use App\Models\Delivery;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Policies\OrderPolicy;
use App\Policies\DeliveryPolicy;
use App\Policies\MenuCategoryPolicy;
use App\Policies\MenuItemPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Order::class => OrderPolicy::class,
        Delivery::class => DeliveryPolicy::class,
        MenuCategory::class => MenuCategoryPolicy::class,
        MenuItem::class => MenuItemPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}
