<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{

    public function run()
    {

        $users = [
            [
                'name' => 'admin',
                'email' => 'admin@gmail.com',
                'role' => 'admin',
            ],
            [
                'name' => 'teacher',
                'email' => 'teacher@gmail.com',
                'role' => 'teacher',
            ],
            [
                'name' => 'student',
                'email' => 'student@gmail.com',
                'role' => 'student',
            ],
        ];

        foreach ($users as $user) {
            try {
                $result = User::create([
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'password' => Hash::make("password"),

                ]);

                $result->assignRole($user['role']);
            } catch (\Exception $e) {
                dd($e);
            }
        }
    }
}
