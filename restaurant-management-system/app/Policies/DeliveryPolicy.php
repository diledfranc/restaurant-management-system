<?php

namespace App\Policies;

use App\Models\Delivery;
use App\Models\User;

class DeliveryPolicy
{
    public function viewAny(User $user)
    {
        return in_array($user->role?->name, ['manager','admin','staff']);
    }

    public function view(User $user, Delivery $delivery)
    {
        if (in_array($user->role?->name, ['manager','admin'])) {
            return true;
        }

        return $user->role?->name === 'staff' && $delivery->assigned_user_id === $user->id;
    }

    public function assign(User $user, Delivery $delivery)
    {
        if (in_array($user->role?->name, ['manager','admin'])) {
            return true;
        }
        
        // Allow staff to claim pending deliveries
        return $user->role?->name === 'staff' && $delivery->status === 'pending';
    }

    public function updateStatus(User $user, Delivery $delivery)
    {
        if (in_array($user->role?->name, ['manager','admin'])) {
            return true;
        }

        return $user->role?->name === 'staff' && $delivery->assigned_user_id === $user->id;
    }
}
