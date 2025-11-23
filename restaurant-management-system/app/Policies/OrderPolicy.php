<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user)
    {
        return in_array($user->role?->name, ['manager','admin','staff']);
    }

    public function view(User $user, Order $order)
    {
        if (in_array($user->role?->name, ['manager','admin'])) {
            return true;
        }

        if ($user->id === $order->user_id) {
            return true;
        }

        if ($user->role?->name === 'staff' && $order->assigned_to === $user->id) {
            return true;
        }

        return false;
    }

    public function create(?User $user)
    {
        // allow guests and authenticated users to create orders
        return true;
    }

    public function updateStatus(User $user, Order $order)
    {
        if (in_array($user->role?->name, ['manager','admin'])) {
            return true;
        }

        if ($user->role?->name === 'staff' && $order->assigned_to === $user->id) {
            return true;
        }

        return false;
    }

    public function assign(User $user, Order $order)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }

    public function delete(User $user, Order $order)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }
}
