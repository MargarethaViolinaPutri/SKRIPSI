<?php
namespace App\Jobs;

use App\Models\TestAttempt;
use App\Service\PythonEvaluationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class EvaluateTestAnswer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected TestAttempt $attempt;
    protected string $studentCode;

    public function __construct(TestAttempt $attempt, string $studentCode)
    {
        $this->attempt = $attempt;
        $this->studentCode = $studentCode;
    }

    public function handle(PythonEvaluationService $evaluator): TestAttempt
    {
        $question = $this->attempt->test->question;

        $scores = $evaluator->evaluate($this->studentCode, $question->test);

        $permanentStudentCodePath = 'student_codes/test_attempt_' . $this->attempt->id . '_' . uniqid() . '.py';
        Storage::disk('public')->put($permanentStudentCodePath, $this->studentCode);

        $totalScore = ($scores['structure_score'] * 0.7) + ($scores['output_accuracy_score'] * 0.3);

        $this->attempt->update([
            'student_code' => $this->studentCode,
            'student_code_path' => $permanentStudentCodePath,
            'output_accuracy_score' => $scores['output_accuracy_score'],
            'structure_score' => $scores['structure_score'],
            'total_score' => $totalScore,
            'finished_at' => now(),
        ]);

        return $this->attempt;
    }
}