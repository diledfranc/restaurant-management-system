<?php

use App\Models\Role;
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '+15555550123',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('new users are assigned the customer role', function () {
    // Ensure role exists (migration/seed independent)
    Role::firstOrCreate(['name' => 'customer']);

    $email = 'customer-role@example.com';

    $this->post(route('register.store'), [
        'name' => 'Customer Role',
        'email' => $email,
        'phone' => '+15555550124',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', $email)->firstOrFail();
    expect($user->roles()->pluck('name'))->toContain('customer');
});