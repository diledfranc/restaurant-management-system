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
        $roleNames = $user->roles->pluck('name')->toArray();
        return in_array('manager', $roleNames) || in_array('admin', $roleNames);
    }

    public function update(User $user, MenuItem $item)
    {
        $roleNames = $user->roles->pluck('name')->toArray();
        return in_array('manager', $roleNames) || in_array('admin', $roleNames);
    }

    public function delete(User $user, MenuItem $item)
    {
        $roleNames = $user->roles->pluck('name')->toArray();
        return in_array('manager', $roleNames) || in_array('admin', $roleNames);
    }
}
