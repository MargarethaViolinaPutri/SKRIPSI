<?php

namespace App\Service;

use Prism\Prism\Prism;
use Prism\Prism\Enums\Provider;
use Illuminate\Support\Facades\Log;
use Exception;

class PrismService
{
    protected $maxRetries = 3;
    protected $retryDelay = 3000; // milliseconds
// dengan berbagai parameter: tring berisi kode Python dari user
// Menentukan tipe FIB (single untuk 1 soal, multiple untuk banyak)
// Menentukan nomor awal soal (default 1)
    public function generateQuestions(string $code, ?string $type = null, int $startNumber = 1): array
    {
        // Check for delimiter '#' to split questions 
        // # → jika ada, berarti input terdiri dari beberapa blok soal → loop per blok.
        if (strpos($code, '#') !== false) {
            $blocks = preg_split('/^#.*$/m', $code, -1, PREG_SPLIT_NO_EMPTY); // Memecah satu teks besar menjadi beberapa blok kode. Setiap blok dianggap 1 soal
            $questions = [];
            $questionNumber = $startNumber;

            foreach ($blocks as $block) {
                $block = trim($block);
                if (empty($block)) {
                    continue;
                }

                $systemPrompt = <<<PROMPT
You are an AI assistant that generates a Python fill-in-the-blank question.
- Use the ENTIRE code block as one unit.
- Insert multiple blanks (____) in different parts such as variable names, operators, logic, condition statements, function names, control structures (if, for, while), and method calls.
- Do NOT blank out any "print" statements; keep them intact.
- Ensure all classes have properly defined constructors (__init__ methods) matching their usage.
- Return JSON array with one object:
[
  {
    "question_number": {$questionNumber},
    "narasi": "...",
    "kode_blank": "...",
    "kode_utuh": "..."
  }
]
- Do NOT include explanation or markdown.
PROMPT;

                $userPrompt = "Here is the Python code:\n\n" . $block;

                $response = Prism::text()
                    ->using(Provider::OpenAI, 'gpt-4.1')
                    ->withSystemPrompt($systemPrompt)
                    ->withPrompt($userPrompt)
                    ->asText();

                $responseText = trim($response->text);
                Log::info("Prism raw response: " . $responseText);

                $cleaned = preg_replace('/^```json\s*/i', '', $responseText);
                $cleaned = preg_replace('/```$/i', '', $cleaned);

                preg_match('/\[\s*\{.*\}\s*\]/s', $cleaned, $matches);
                $jsonArray = $matches[0] ?? null;

                if ($jsonArray) {
                    $jsonString = str_replace(["\r", "\0"], '', $jsonArray);
                    $jsonString = preg_replace('/[\\x00-\\x1F\\x7F]/u', '', $jsonString);

                    $decoded = json_decode($jsonString, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $questions = array_merge($questions, $decoded);
                    } else {
                        throw new Exception("JSON Decode Error: " . json_last_error_msg());
                    }
                } else {
                    throw new Exception("No valid JSON array found in Prism response.");
                }

                $questionNumber++;
            }

            return $questions;
        }

        // OOP-aware type detection
        if ($type === null) {
            $hasClass = preg_match('/class\s+\w+/', $code);
            $hasInheritance = preg_match('/class\s+\w+\s*\(\s*\w+\s*\)/', $code);
            $hasMethodCall = preg_match('/\w+\.\w+\(/', $code);

            if ($hasClass && ($hasInheritance || $hasMethodCall)) {
                $type = 'single';
            } else {
                $type = 'multiple';
            }
        }

        $attempt = 0;

        while ($attempt < $this->maxRetries) {
            try {
                $attempt++;

                $systemPrompt = ($type === 'single') ? <<<PROMPT
You are an AI assistant that generates a single Python fill-in-the-blank question.
- Use the ENTIRE code as one unit.
- Insert multiple blanks (____) in different parts such as class names, method names, inheritance, and object usage.
- Do NOT blank out any "print" statements; keep them intact.
- Ensure all classes have properly defined constructors (__init__ methods) matching their usage.
- Return JSON array with one object:
[
  {
    "question_number": 1,
    "narasi": "...",
    "kode_blank": "...",
    "kode_utuh": "..."
  }
]
- Do NOT include explanation or markdown.
PROMPT
                :
<<<PROMPT
You are an AI assistant that generates Python fill-in-the-blank questions.
- Split the code into logical blocks (per class/function).
- For each block:
    - Blank out key parts using ____ (e.g., name, operator, logic, condition statement, function name, operator, control structures (if, for, while), and method calls).
    - Do NOT blank out any "print" statements; keep them intact.
    - Ensure all classes have properly defined constructors (__init__ methods) matching their usage.
    - Provide `kode_blank` and original `kode_utuh` (same block).
- Output must be a JSON array:
[
  {
    "question_number": 1,
    "narasi": "...",
    "kode_blank": "...",
    "kode_utuh": "..."
  }
]
- Only return valid JSON. No markdown or extra text.
PROMPT;

                $userPrompt = "Here is the Python code:\n\n" . $code;

                $response = Prism::text()
                    ->using(Provider::OpenAI, 'gpt-4.1')
                    ->withSystemPrompt($systemPrompt)
                    ->withPrompt($userPrompt)
                    ->asText();

                $responseText = trim($response->text);
                Log::info("Prism raw response: " . $responseText);

                $cleaned = preg_replace('/^```json\s*/i', '', $responseText);
                $cleaned = preg_replace('/```$/i', '', $cleaned);

                preg_match('/\[\s*\{.*\}\s*\]/s', $cleaned, $matches);
                $jsonArray = $matches[0] ?? null;

                if ($jsonArray) {
                    $jsonString = str_replace(["\r", "\0"], '', $jsonArray);
                    $jsonString = preg_replace('/[\\x00-\\x1F\\x7F]/u', '', $jsonString);

                    $decoded = json_decode($jsonString, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return $decoded;
                    } else {
                        throw new Exception("JSON Decode Error: " . json_last_error_msg());
                    }
                } else {
                    throw new Exception("No valid JSON array found in Prism response.");
                }
            } catch (Exception $e) {
                Log::error("Prism generateQuestions attempt {$attempt} error: " . $e->getMessage());

                if (
                    stripos($e->getMessage(), 'rate limit') !== false ||
                    stripos($e->getMessage(), 'quota') !== false ||
                    stripos($e->getMessage(), 'insufficient_quota') !== false
                ) {
                    if ($attempt < $this->maxRetries) {
                        usleep($this->retryDelay * 1000 * $attempt);
                        continue;
                    }
                    throw new Exception('API quota exceeded or rate limited.');
                }

                throw $e;
            }
        }

        throw new Exception("Failed to generate questions after {$this->maxRetries} attempts.");
    }
}
