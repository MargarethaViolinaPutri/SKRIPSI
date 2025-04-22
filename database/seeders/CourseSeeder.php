<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                "name" => "Dasar Pemograman",
                "desc" => "Belajar Dasar Pemograman menggunakan python",
            ],
            [
                "name" => "Pemograman Berorientasi Objek",
                "desc" => "Belajar Dasar Pemograman Berorientasi Objek python",
            ],
        ];

        foreach ($courses as $course) {
            Course::create($course);
        }
    }
}
