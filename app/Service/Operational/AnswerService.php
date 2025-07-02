<?php

namespace App\Service\Operational;

use App\Contract\Operational\AnswerContract;
use App\Service\BaseService;
use App\Models\Answer;
use App\Models\Question;
use App\Service\PythonEvaluationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AnswerService extends BaseService implements AnswerContract
{
    protected PythonEvaluationService $evaluator;

    public function __construct(Answer $model, PythonEvaluationService $evaluator)
    {
        $this->model = $model; 
        $this->evaluator = $evaluator;
    }

    /**
     * Save the answer and calculate the score using a unified pytest evaluation.
     *
     * @param int $questionId
     * @param int $userId
     * @param string $studentCode
     * @param string $startTime
     * @param string $endTime
     * @return Answer
     */
    public function evaluateAndSaveAnswer(int $questionId, int $userId, string $studentCode, string $startTime, string $endTime): Answer
    {
        $question = Question::findOrFail($questionId);

        $scores = $this->evaluator->evaluate($studentCode, $question->test);

        $totalScore = ($scores['structure_score'] * 0.7) + ($scores['output_accuracy_score'] * 0.3);

        $permanentStudentCodePath = 'student_codes/' . uniqid('student_code_') . '.py';
        
        Storage::disk('public')->put($permanentStudentCodePath, $studentCode);

        return $this->model->create([
            'question_id'           => $questionId,
            'user_id'               => $userId,
            'student_code'          => $studentCode,
            'student_code_path'     => $permanentStudentCodePath,
            'output_accuracy_score' => $scores['output_accuracy_score'],
            'structure_score'       => $scores['structure_score'],
            'total_score'           => $totalScore,
            'started_at'            => $startTime,
            'finished_at'           => $endTime,
        ]);
    }
}
