<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TableManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdminUser()
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role);
        return $user;
    }

    public function test_admin_can_view_tables_page()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)->get('/tables');

        $response->assertStatus(200);
    }

    public function test_admin_can_create_table()
    {
        $admin = $this->createAdminUser();

        $response = $this->actingAs($admin)
            ->from('/tables')
            ->post('/tables', [
                'table_number' => 'T1',
                'capacity' => 4,
                'status' => 'available',
                'shape' => 'square',
                'position_x' => 100,
                'position_y' => 100,
            ]);

        $response->assertRedirect('/tables');
        $this->assertDatabaseHas('tables', ['table_number' => 'T1']);
    }

    public function test_admin_can_update_table_position()
    {
        $admin = $this->createAdminUser();
        $table = Table::create([
            'table_number' => 'T1',
            'capacity' => 4,
            'status' => 'available',
            'shape' => 'square',
            'position_x' => 100,
            'position_y' => 100,
        ]);

        $response = $this->actingAs($admin)->patch("/tables/{$table->id}/position", [
            'position_x' => 200,
            'position_y' => 200,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tables', [
            'id' => $table->id,
            'position_x' => 200,
            'position_y' => 200,
        ]);
    }

    public function test_admin_can_delete_table()
    {
        $admin = $this->createAdminUser();
        $table = Table::create([
            'table_number' => 'T1',
            'capacity' => 4,
            'status' => 'available',
            'shape' => 'square',
            'position_x' => 100,
            'position_y' => 100,
        ]);

        $response = $this->actingAs($admin)
            ->from('/tables')
            ->delete("/tables/{$table->id}");

        $response->assertRedirect('/tables');
        $this->assertDatabaseMissing('tables', ['id' => $table->id]);
    }
}
