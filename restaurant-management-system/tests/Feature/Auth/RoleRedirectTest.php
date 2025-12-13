<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Ensure roles exist
        Role::firstOrCreate(['name' => 'customer']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'manager']);
    }

    public function test_customer_is_redirected_to_shop_after_login()
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $user->roles()->attach(Role::where('name', 'customer')->first());

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/shop');
    }

    public function test_admin_is_redirected_to_dashboard_after_login()
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $user->roles()->attach(Role::where('name', 'admin')->first());

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
    }

    public function test_manager_is_redirected_to_dashboard_after_login()
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $user->roles()->attach(Role::where('name', 'manager')->first());

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
    }
}
