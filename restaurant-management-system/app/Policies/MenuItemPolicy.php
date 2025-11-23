<?php

namespace App\Policies;

use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    public function viewAny(?User $user)
    {
        return true; // public
    }

    public function view(?User $user, MenuItem $item)
    {
        return true; // public
    }

    public function create(User $user)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }

    public function update(User $user, MenuItem $item)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }

    public function delete(User $user, MenuItem $item)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }
}
