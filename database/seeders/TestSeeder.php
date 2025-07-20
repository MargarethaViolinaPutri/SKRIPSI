<?php

namespace Database\Seeders;

use App\Models\Test;
use App\Models\TestQuestion;
use App\Models\TestQuestionOption;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
        TestQuestionOption::truncate();
        TestQuestion::truncate();
        Test::truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $testsData = [
            [
                'title' => 'Pre-test Pengetahuan Dasar Web',
                'description' => 'Tes untuk mengukur pemahaman dasar tentang teknologi web development.',
                'type' => 'pretest',
                'status' => 'published',
                'duration_in_minutes' => 30,
                'available_from' => now()->subDays(1),
                'available_until' => now()->addDays(30),
                'questions' => [
                    [
                        'question_text' => 'Apa kepanjangan dari HTML?',
                        'options' => [
                            ['option_text' => 'HyperText Markup Language', 'is_correct' => true],
                            ['option_text' => 'Hyperlinks and Text Markup Language', 'is_correct' => false],
                            ['option_text' => 'Home Tool Markup Language', 'is_correct' => false],
                        ]
                    ],
                    [
                        'question_text' => 'Manakah properti CSS yang digunakan untuk mengubah warna teks?',
                        'options' => [
                            ['option_text' => 'font-color', 'is_correct' => false],
                            ['option_text' => 'text-color', 'is_correct' => false],
                            ['option_text' => 'color', 'is_correct' => true],
                            ['option_text' => 'background-color', 'is_correct' => false],
                        ]
                    ],
                ]
            ],
            [
                'title' => 'Post-test Konsep OOP PHP',
                'description' => 'Tes untuk mengukur pemahaman setelah mempelajari konsep OOP di PHP.',
                'type' => 'posttest',
                'status' => 'draft',
                'duration_in_minutes' => 60,
                'available_from' => null,
                'available_until' => null,
                'questions' => [
                    [
                        'question_text' => 'Keyword mana yang digunakan untuk membuat sebuah objek dari sebuah class?',
                        'options' => [
                            ['option_text' => 'create', 'is_correct' => false],
                            ['option_text' => 'new', 'is_correct' => true],
                            ['option_text' => 'object', 'is_correct' => false],
                        ]
                    ],
                    [
                        'question_text' => 'Prinsip OOP yang mana yang berarti "satu bentuk, banyak implementasi"?',
                        'options' => [
                            ['option_text' => 'Inheritance', 'is_correct' => false],
                            ['option_text' => 'Encapsulation', 'is_correct' => false],
                            ['option_text' => 'Polymorphism', 'is_correct' => true],
                        ]
                    ],
                ]
            ]
        ];

        DB::transaction(function () use ($testsData) {
            foreach ($testsData as $testData) {
                $test = Test::create([
                    'title' => $testData['title'],
                    'description' => $testData['description'],
                    'type' => $testData['type'],
                    'status' => $testData['status'],
                    'duration_in_minutes' => $testData['duration_in_minutes'],
                    'available_from' => $testData['available_from'],
                    'available_until' => $testData['available_until'],
                ]);

                if (isset($testData['questions'])) {
                    foreach ($testData['questions'] as $questionData) {
                        $question = $test->questions()->create([
                            'question_text' => $questionData['question_text']
                        ]);

                        if (isset($questionData['options'])) {
                            foreach ($questionData['options'] as $optionData) {
                                $question->options()->create([
                                    'option_text' => $optionData['option_text'],
                                    'is_correct' => $optionData['is_correct']
                                ]);
                            }
                        }
                    }
                }
            }
        });
    }
}
