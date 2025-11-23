<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RolesSeeder;
use Database\Seeders\UsersSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles, admin user, and demo data (reads ADMIN_* from .env)
        $this->call([
            RolesSeeder::class,
            UsersSeeder::class,
            DemoSeeder::class,
        ]);

        // Example test user (kept for local testing)
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'phone' => env('TEST_USER_PHONE', '0000000000'),
                'email_verified_at' => now(),
            ]
        );
    }
}
