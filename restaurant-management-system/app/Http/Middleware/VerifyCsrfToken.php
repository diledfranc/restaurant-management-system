<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;
use Illuminate\Support\Facades\Log;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*',
    ];

    /**
     * Override to bypass CSRF verification in testing environment.
     */
    public function handle($request, Closure $next)
    {
        Log::error('VerifyCsrfToken environment: ' . app()->environment());

        if (app()->environment('testing')) {
            Log::error('VerifyCsrfToken: bypassing CSRF in testing');
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}
