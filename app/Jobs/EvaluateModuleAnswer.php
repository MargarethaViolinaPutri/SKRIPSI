<?php
namespace App\Jobs;

use App\Models\Answer;
use App\Models\Question;
use App\Service\PythonEvaluationService;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Storage;

class EvaluateModuleAnswer
{
    use Dispatchable;

    protected int $questionId;
    protected int $userId;
    protected string $studentCode;
    protected string $startTime;
    protected string $endTime;

    public function __construct(int $questionId, int $userId, string $studentCode, string $startTime, string $endTime)
    {
        $this->questionId = $questionId;
        $this->userId = $userId;
        $this->studentCode = $studentCode;
        $this->startTime = $startTime;
        $this->endTime = $endTime;
    }

    public function handle(PythonEvaluationService $evaluator): Answer
    {
        $question = Question::findOrFail($this->questionId);

        $scores = $evaluator->evaluate($this->studentCode, $question->test);

        $permanentStudentCodePath = 'student_codes/' . uniqid('student_code_') . '.py';
        Storage::disk('public')->put($permanentStudentCodePath, $this->studentCode);

        $totalScore = ($scores['structure_score'] * 0.7) + ($scores['output_accuracy_score'] * 0.3);

        return Answer::create([
            'question_id'           => $this->questionId,
            'user_id'               => $this->userId,
            'student_code'          => $this->studentCode,
            'student_code_path'     => $permanentStudentCodePath,
            'output_accuracy_score' => $scores['output_accuracy_score'],
            'structure_score'       => $scores['structure_score'],
            'total_score'           => $totalScore,
            'started_at'            => $this->startTime,
            'finished_at'           => $this->endTime,
        ]);
    }
}