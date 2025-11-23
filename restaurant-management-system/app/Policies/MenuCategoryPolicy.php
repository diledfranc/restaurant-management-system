<?php

namespace App\Policies;

use App\Models\MenuCategory;
use App\Models\User;

class MenuCategoryPolicy
{
    public function viewAny(?User $user)
    {
        return true; // public
    }

    public function view(?User $user, MenuCategory $category)
    {
        return true; // public
    }

    public function create(User $user)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }

    public function update(User $user, MenuCategory $category)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }

    public function delete(User $user, MenuCategory $category)
    {
        return in_array($user->role?->name, ['manager','admin']);
    }
}
