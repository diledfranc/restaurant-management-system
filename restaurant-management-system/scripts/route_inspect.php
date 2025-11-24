<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$routes = collect($app['router']->getRoutes())->map(function ($r) {
    return [
        'methods' => $r->methods(),
        'uri' => $r->uri(),
        'name' => $r->getName(),
        'action' => $r->getActionName(),
        'middleware' => $r->gatherMiddleware(),
    ];
});

$filtered = $routes->filter(fn($r) => $r['name'] === 'verification.send')->values();

echo $filtered->toJson(JSON_PRETTY_PRINT);
