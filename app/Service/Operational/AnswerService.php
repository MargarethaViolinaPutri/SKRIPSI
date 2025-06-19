<?php

namespace App\Service\Operational;

use App\Contract\Operational\AnswerContract;
use App\Service\BaseService;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class AnswerService extends BaseService implements AnswerContract
{
    protected Model $model;

    public function __construct(Answer $model)
    {
        $this->model = $model;
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

        $evalId = 'eval_' . Str::random(16);
        $evalPath = storage_path("app/evaluations/{$evalId}");
        File::makeDirectory($evalPath, 0755, true);

        $outputAccuracyScore = 0.0;
        $structureScore = 0.0;

        try {
            $studentCodePath = "{$evalPath}/student_code.py";
            $referenceCodePath = "{$evalPath}/reference_code.py";
            $evaluatorScriptPath = "{$evalPath}/evaluate_plain.py";

            File::put($studentCodePath, $studentCode);
            File::put($referenceCodePath, $question->test);
            File::put($evaluatorScriptPath, $this->getPlainEvaluatorCode());

            $env = ['PYTHONHASHSEED' => 0];

            $process = new Process([
                'python', 
                $evaluatorScriptPath, 
                $studentCodePath, 
                $referenceCodePath
            ],
                $evalPath,
                $env
            );

            $process->setTimeout(15);
            $process->mustRun();

            $resultJson = $process->getOutput();
            $scores = json_decode($resultJson, true);

            $outputAccuracyScore = $scores['output_accuracy_score'] ?? 0.0;
            $structureScore = $scores['structure_score'] ?? 0.0;

        } catch (ProcessFailedException $e) {
            Log::error('PLAIN PYTHON SCRIPT FAILED!');
            Log::error('Error Message: ' . $e->getMessage());
            Log::error('StdErr: ' . $e->getProcess()->getErrorOutput());
            Log::error('StdOut: ' . $e->getProcess()->getOutput());

        } finally {
             File::deleteDirectory($evalPath);
        }

        $permanentStudentCodePath = 'student_codes/' . uniqid('student_code_') . '.py';
        Storage::disk('public')->put($permanentStudentCodePath, $studentCode);

        // 70% from structure, 30% from output
        $totalScore = ($structureScore * 0.7) + ($outputAccuracyScore * 0.3);

        return $this->model->create([
            'question_id'           => $questionId,
            'user_id'               => $userId,
            'student_code'          => $studentCode,
            'student_code_path'     => $permanentStudentCodePath,
            'output_accuracy_score' => $outputAccuracyScore,
            'structure_score'       => $structureScore,
            'total_score'           => $totalScore,
            'started_at'            => $startTime,
            'finished_at'           => $endTime,
        ]);
    }

    /**
     * Returns the content of the new, dependency-free evaluator script.
     */
    private function getPlainEvaluatorCode(): string
    {
        return <<<'PYTHON'
        import sys
        import subprocess
        import ast
        import json

        def run_code(path: str) -> str:
            try:
                result = subprocess.run(
                    [sys.executable, path],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    check=False,
                    env={'PYTHONHASHSEED': '0'} # Menurunkan environment variable
                )
                if result.returncode != 0:
                    return f"__error__: {result.stderr.strip()}"
                return result.stdout.strip()
            except subprocess.TimeoutExpired:
                return "__error__: Execution timed out after 5 seconds."
            except Exception as e:
                return f"__error__: An unexpected error occurred: {e}"

        def get_ast_structure(path: str) -> list:
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    source = f.read()
                return [type(node).__name__ for node in ast.walk(ast.parse(source))]
            except Exception:
                return []

        def main():
            if len(sys.argv) != 3:
                print(json.dumps({"error": "Invalid arguments. Expected student_path and reference_path."}))
                sys.exit(1)

            student_path = sys.argv[1]
            reference_path = sys.argv[2]
            
            # calculate output score
            student_output = run_code(student_path)
            reference_output = run_code(reference_path)
            
            output_score = 0.0
            if not student_output.startswith("__error__") and student_output == reference_output:
                output_score = 100.0
                
            # calculate structure score
            struct_student = get_ast_structure(student_path)
            struct_ref = get_ast_structure(reference_path)
            
            structure_score = 0.0
            if struct_student and struct_ref:
                set_a, set_b = set(struct_student), set(struct_ref)
                common = set_a.intersection(set_b)
                total = set_a.union(set_b)
                if total:
                    structure_score = (len(common) / len(total)) * 100

            final_result = {
                "output_accuracy_score": round(output_score, 2),
                "structure_score": round(structure_score, 2)
            }
            print(json.dumps(final_result))

        if __name__ == "__main__":
            main()
        PYTHON;
    }
}