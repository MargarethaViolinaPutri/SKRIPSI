<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $questions = [
            [
                "module_id" => 1,
                "order" => 1,
                "name" => "Hello World",
                "desc" => "Hello World",
                "code" => "print('Hello World')",
                "test" => "print('Hello World')",
            ],
        ];

        foreach ($questions as $question) {
            Question::create($question);
        }
    }
}
