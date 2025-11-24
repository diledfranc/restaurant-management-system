<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\User;
use Illuminate\Http\Request;

// create user
$user = User::factory()->withoutTwoFactor()->create(['phone' => '0000000000']);

// prepare request
$request = Request::create(route('login.store', [], false), 'POST', [
    'email' => $user->email,
    'password' => 'password',
]);
$request->headers->set('Accept', 'application/json');

$response = $kernel->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Headers:\n";
foreach ($response->headers->all() as $k => $v) {
    echo "  $k: " . implode(', ', $v) . "\n";
}

$body = (string) $response->getContent();
if (strlen($body) > 1000) $body = substr($body,0,1000) . "... (truncated)";

echo "Body:\n" . $body . "\n";

$kernel->terminate($request, $response);
