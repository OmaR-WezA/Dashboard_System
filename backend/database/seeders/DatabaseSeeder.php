<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ]
        );

        if ($admin->wasRecentlyCreated) {
            $this->command->info('Admin user created:');
        } else {
            $this->command->info('Admin user already exists:');
        }
        $this->command->info('Email: admin@example.com');
        $this->command->info('Password: password');
    }
}

