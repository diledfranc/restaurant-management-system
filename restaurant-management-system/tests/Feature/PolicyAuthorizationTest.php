<?php

use App\Models\Role;
use App\Models\User;

it('prevents non-manager from viewing reports and activity logs', function () {
    // create a customer role and user
    $role = Role::firstOrCreate(['name' => 'customer']);
    $user = User::factory()->create(['phone' => '0000000000']);
    $user->roles()->attach($role->id);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/reports/sales')
        ->assertStatus(403);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/activity-logs')
        ->assertStatus(403);
});

it('allows manager to view reports and activity logs', function () {
    $role = Role::firstOrCreate(['name' => 'manager']);
    $user = User::factory()->create(['phone' => '0000000000']);
    $user->roles()->attach($role->id);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/reports/sales')
        ->assertStatus(200);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/activity-logs')
        ->assertStatus(200);
});
