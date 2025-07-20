<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {

        $base = [
            SettingSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
        ];

        $dummy = [
            CourseSeeder::class,
            ModuleSeeder::class,
            QuestionSeeder::class,
            ClassRoomSeeder::class,
        ];

        $seeder = env('SEEDER_FAKER', false) ? [...$base, ...$dummy] : $base;

        $this->call($seeder);
    }
}
