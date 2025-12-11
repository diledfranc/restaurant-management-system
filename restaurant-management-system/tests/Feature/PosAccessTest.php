<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_access_pos()
    {
        $this->seed(\Database\Seeders\RolesSeeder::class);
        
        $user = User::factory()->create();
        $role = Role::where('name', 'staff')->first();
        $user->roles()->attach($role);

        $response = $this->actingAs($user)->get('/pos');

        $response->assertStatus(200);
    }

    public function test_cashier_can_access_pos()
    {
        $this->seed(\Database\Seeders\RolesSeeder::class);
        
        $user = User::factory()->create();
        $role = Role::where('name', 'cashier')->first();
        $user->roles()->attach($role);

        $response = $this->actingAs($user)->get('/pos');

        $response->assertStatus(200);
    }

    public function test_manager_can_access_pos()
    {
        $this->seed(\Database\Seeders\RolesSeeder::class);
        
        $user = User::factory()->create();
        $role = Role::where('name', 'manager')->first();
        $user->roles()->attach($role);

        $response = $this->actingAs($user)->get('/pos');

        $response->assertStatus(200);
    }

    public function test_customer_cannot_access_pos()
    {
        $this->seed(\Database\Seeders\RolesSeeder::class);
        
        $user = User::factory()->create();
        $role = Role::where('name', 'customer')->first();
        $user->roles()->attach($role);

        $response = $this->actingAs($user)->get('/pos');

        $response->assertStatus(302); // Redirect to dashboard
        $response->assertRedirect(route('dashboard'));
    }
}
