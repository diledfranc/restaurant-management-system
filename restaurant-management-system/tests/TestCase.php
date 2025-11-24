<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Log;

abstract class TestCase extends BaseTestCase
{
    /**
     * Creates the application for the tests.
     */
    public function createApplication()
    {
        $app = require __DIR__ . '/../bootstrap/app.php';

        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }

    /**
     * Set up the test environment.
     * Disable CSRF middleware for tests to avoid 419 responses.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Disable our app CSRF middleware during tests (test-only)
        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class);
        // Also disable the framework's base CSRF middleware in case the pipeline references it
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

        // Log that test setUp ran (helps debug middleware disabling)
        Log::error('Tests\\TestCase::setUp executed');

        // Rebuild the 'web' middleware group for tests without the CSRF middleware so
        // the session and cookie middleware still run (needed by Fortify views), but
        // CSRF checks are disabled.
        $this->app['router']->middlewareGroup('web', [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    }
}
