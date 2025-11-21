Initial project setup (Commit: "Initial project setup with file structure")

This commit adds initial configuration placeholders and scaffolding for the RMS project. It does NOT install composer packages — run the commands below locally and commit the results.

Steps to complete locally:

1. Install required packages for SPA auth and RBAC

```powershell
cd "c:\laragon\www\final-project-diledfranc\restaurant-management-system"
composer require laravel/sanctum spatie/laravel-permission
```

2. Publish vendor configs and run migrations

```powershell
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

3. Update `.env`

- Add your app domain(s) to `SANCTUM_STATEFUL_DOMAINS`, e.g. `localhost,127.0.0.1`.
- Ensure `SESSION_DRIVER` is set appropriately (database or cookie) and `QUEUE_CONNECTION` is configured.

4. Kernel / Middleware

- Ensure `EnsureFrontendRequestsAreStateful` (provided by Sanctum) is registered where appropriate. See Laravel Sanctum docs.

5. Optional: add `HasRoles` trait to `App\Models\User` after `spatie/laravel-permission` is installed:

```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles; // add this after Spatie installed
    // ...
}
```

6. Commit local changes

```powershell
git add .
git commit -m "Initial project setup with file structure"
```

Notes:
- The `config/sanctum.php` and `config/permission.php` files are placeholders to help you configure Sanctum and Spatie permission after installing packages.
- I also created empty scaffolding directories so subsequent commits can add Jobs, Notifications, Policies, Services, and Observers in focused patches.

If you want, I can now scaffold the migrations for roles and core domain tables for the next small commit.
