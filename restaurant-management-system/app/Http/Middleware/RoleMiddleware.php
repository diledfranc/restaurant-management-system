<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Accepts one or more role names.
     */
    public function handle($request, Closure $next, ...$roles)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // If user has a roles() relation (many-to-many), check collection
        if (method_exists($user, 'roles')) {
            $names = $user->roles->pluck('name')->map(fn($n) => (string) $n)->toArray();
            foreach ($roles as $role) {
                if (in_array($role, $names, true)) {
                    return $next($request);
                }
            }
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Fallback: check singular `role` relation/property
        if (isset($user->role) && isset($user->role->name) && in_array($user->role->name, $roles, true)) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }
}
