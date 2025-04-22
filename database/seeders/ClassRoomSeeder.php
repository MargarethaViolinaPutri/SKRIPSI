<?php

namespace Database\Seeders;

use App\Models\ClassRoom;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassRoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classrooms = [
            [
                "user_id" => 2,
                "level" => 10,
                "name" => "RPL 10",
                "code" => "RPL10",
            ],
        ];

        foreach ($classrooms as $classroom) {
            ClassRoom::create($classroom);
        }
    }
}
