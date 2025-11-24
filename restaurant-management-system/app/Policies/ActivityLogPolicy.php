<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ActivityLog;

class ActivityLogPolicy
{
    /**
     * Determine whether the user can view any activity logs.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role->name, ['manager', 'admin']);
    }

    /**
     * Determine whether the user can view a specific activity log.
     */
    public function view(User $user, ActivityLog $log): bool
    {
        return in_array($user->role->name, ['manager', 'admin']);
    }
}
