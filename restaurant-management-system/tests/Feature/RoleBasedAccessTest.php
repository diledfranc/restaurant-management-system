<?php

use App\Models\Role;
use App\Models\User;

test('customer users cannot access staff management page', function () {
    $customerRole = Role::firstOrCreate(['name' => 'customer']);
    $user = User::factory()->create();
    $user->roles()->sync([$customerRole->id]);

    $response = $this->actingAs($user)->get(route('staff.index'));

    $response->assertRedirect(route('dashboard'));
});

test('customer users cannot access menu management page', function () {
    $customerRole = Role::firstOrCreate(['name' => 'customer']);
    $user = User::factory()->create();
    $user->roles()->sync([$customerRole->id]);

    $response = $this->actingAs($user)->get(route('menu.index'));

    $response->assertRedirect(route('dashboard'));
});

test('admin users can access staff management page', function () {
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $user = User::factory()->create();
    $user->roles()->sync([$adminRole->id]);

    $response = $this->actingAs($user)->get(route('staff.index'));

    $response->assertStatus(200);
});

test('manager users can access menu management but not staff management', function () {
    $managerRole = Role::firstOrCreate(['name' => 'manager']);
    $user = User::factory()->create();
    $user->roles()->sync([$managerRole->id]);

    // Can access menu
    $response = $this->actingAs($user)->get(route('menu.index'));
    $response->assertStatus(200);

    // Cannot access staff
    $response = $this->actingAs($user)->get(route('staff.index'));
    $response->assertRedirect(route('dashboard'));
});

test('staff users can access orders but not staff management', function () {
    $staffRole = Role::firstOrCreate(['name' => 'staff']);
    $user = User::factory()->create();
    $user->roles()->sync([$staffRole->id]);

    // Can access orders
    $response = $this->actingAs($user)->get(route('orders.index'));
    $response->assertStatus(200);

    // Cannot access staff
    $response = $this->actingAs($user)->get(route('staff.index'));
    $response->assertRedirect(route('dashboard'));
});
