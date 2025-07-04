<?php
namespace App\Service;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class PythonEvaluationService
{
    /**
     * evaluate code & return score
     *
     * @param string $studentCode
     * @param string $referenceCode (berisi dari kolom ->test)
     * @return array ['output_accuracy_score' => float, 'structure_score' => float]
     */
    public function evaluate(string $studentCode, string $referenceCode): array
    {
        $evalId = 'eval_' . Str::random(16);
        $evalPath = storage_path("app/evaluations/{$evalId}");
        File::makeDirectory($evalPath, 0755, true);

        try {
            File::put("{$evalPath}/student_code.py", $studentCode);
            File::put("{$evalPath}/reference_code.py", $referenceCode);
            File::put("{$evalPath}/evaluate_plain.py", $this->getPlainEvaluatorCode());

            $pythonExecutable = env('PYTHON_EXECUTABLE', '/usr/bin/python3');

            $env = ['PYTHONHASHSEED' => 0];

            $process = new Process([
                $pythonExecutable,
                "{$evalPath}/evaluate_plain.py",
                "{$evalPath}/student_code.py",
                "{$evalPath}/reference_code.py"
            ], $evalPath, $env);

            $process->setTimeout(15)->mustRun();
            $scores = json_decode($process->getOutput(), true);

            return [
                'output_accuracy_score' => $scores['output_accuracy_score'] ?? 0.0,
                'structure_score' => $scores['structure_score'] ?? 0.0,
            ];

        } catch (ProcessFailedException $e) {
            Log::error('PYTHON EVALUATION FAILED: ' . $e->getMessage());
            return ['output_accuracy_score' => 0.0, 'structure_score' => 0.0];
        } finally {
            File::deleteDirectory($evalPath);
        }
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

        def normalize_output(output: str) -> str:
            # Normalize output by stripping whitespace and converting to lowercase
            return output.strip().lower()

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