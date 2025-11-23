<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run()
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@example.test');
        $adminPassword = env('ADMIN_PASSWORD', 'password');
        $adminName = env('ADMIN_NAME', 'Administrator');
        $adminPhone = env('ADMIN_PHONE', '0000000000');

        $user = User::firstOrCreate([
            'email' => $adminEmail,
        ], [
            'name' => $adminName,
            'email_verified_at' => now(),
            'password' => Hash::make($adminPassword),
            'phone' => $adminPhone,
        ]);

        // attach admin role if roles table exists and role present
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
        }
    }
}
