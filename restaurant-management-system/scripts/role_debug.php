<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

$role = Role::firstOrCreate(['name'=>'manager']);
$user = User::factory()->create(['phone'=>'0000000000']);
$user->roles()->attach($role->id);
$userFresh = User::find($user->id);

echo "user id: {$user->id}\n";
echo "user->role->name (fresh): " . ($userFresh->role?->name ?? 'none') . "\n";

echo "Gate view-reports (forUser user): ";
var_export(Gate::forUser($user)->allows('view-reports'));
echo "\n";

echo "Gate view-reports (forUser fresh): ";
var_export(Gate::forUser($userFresh)->allows('view-reports'));
echo "\n";

echo "Activity viewAny: ";
var_export(Gate::forUser($user)->allows('viewAny', \App\Models\ActivityLog::class));
echo "\n";

