<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                "course_id" => 1,
                "name" => "Instalasi",
                "desc" => "Instalasi",
            ],
            [
                "course_id" => 1,
                "name" => "Percabangan",
                "desc" => "Percabangan",
            ],
        ];

        foreach ($modules as $module) {
            Module::create($module);
        }
    }
}
