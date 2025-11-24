<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Gate;

$u = User::whereHas('roles', function($q){ $q->where('name','customer'); })->first();

echo "User: " . ($u?->id ?? 'none') . "\n";

try {
    $reports = Gate::forUser($u)->allows('view-reports') ? 'allowed' : 'denied';
} catch (Throwable $e) {
    $reports = 'error: '.$e->getMessage();
}

try {
    $activity = Gate::forUser($u)->allows('viewAny', ActivityLog::class) ? 'allowed' : 'denied';
} catch (Throwable $e) {
    $activity = 'error: '.$e->getMessage();
}

echo "view-reports: " . $reports . "\n";
echo "activity viewAny: " . $activity . "\n";

exit(0);
