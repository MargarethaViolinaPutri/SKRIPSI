<?php
namespace App\Service\Operational;

use App\Models\TestAttempt;
use App\Models\TestQuestion;
use App\Service\PythonEvaluationService;
use Illuminate\Support\Facades\Storage;

class TestAnswerService{
    protected PythonEvaluationService $evaluator;

    public function __construct(PythonEvaluationService $evaluator)
    {
        $this->evaluator = $evaluator;
    }

    public function evaluateAndUpdateAttempt(TestAttempt $attempt, string $studentCode): TestAttempt
    {
        $question = $attempt->test->question;

        $scores = $this->evaluator->evaluate($studentCode, $question->test);

        $permanentStudentCodePath = 'student_codes/test_attempt_' . $attempt->id . '_' . uniqid() . '.py';
        Storage::disk('public')->put($permanentStudentCodePath, $studentCode);

        $totalScore = ($scores['structure_score'] * 0.7) + ($scores['output_accuracy_score'] * 0.3);

        $attempt->update([
            'student_code' => $studentCode,
            'student_code_path' => $permanentStudentCodePath,
            'output_accuracy_score' => $scores['output_accuracy_score'],
            'structure_score' => $scores['structure_score'],
            'total_score' => $totalScore,
            'finished_at' => now(),
        ]);

        return $attempt;
    }
}