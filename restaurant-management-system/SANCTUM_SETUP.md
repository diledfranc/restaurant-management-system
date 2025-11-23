Sanctum setup (local / PowerShell)

Follow these steps to install and configure Laravel Sanctum for SPA cookie-based auth or API tokens.

1) Install the package via Composer (run from project root):

```powershell
# from project root
composer require laravel/sanctum
```

2) Publish Sanctum assets (migration + config):

```powershell
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

3) Run migrations (will apply Sanctum tables):

```powershell
php artisan migrate
```

4) Confirm `config/sanctum.php` contains your SPA domains. You can set in `.env`:

```powershell
# Example values (adjust for your dev environment)
$env:SANCTUM_STATEFUL_DOMAINS = "localhost,localhost:3000,127.0.0.1"
$env:SESSION_DOMAIN = "localhost"
```

5) If your frontend is on a separate origin (e.g. `http://localhost:3000`), have the SPA send the initial CSRF cookie request before API calls:

- GET `/sanctum/csrf-cookie` (fetch with credentials)
- Then POST `/login` (or other authenticated request) with credentials

6) Notes / common pitfalls
- If you prefer token-based API access for mobile apps, use `createToken()` on the user and return the plain-text token.
- Make sure `SESSION_DRIVER` is not `array` in production; cookie-based SPA auth relies on session persistence.
- If you see CORS or cookie issues, check `config/cors.php` and ensure `supports_credentials` is true and `allowed_origins` includes your SPA origin.

If you want I can run the `vendor:publish` and `php artisan migrate` steps here — but `composer require` must run locally (it modifies `composer.json` and downloads vendor packages). I can prepare and run the publish/migrate commands after you install the package, or provide an automated PowerShell snippet to run both once you confirm.
