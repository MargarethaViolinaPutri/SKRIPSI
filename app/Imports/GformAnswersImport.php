<?php

namespace App\Imports;

use App\Models\Answer;
use App\Models\Module;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class GformAnswersImport implements ToCollection, WithChunkReading
{
    protected Module $module;

    public function __construct(int $moduleId)
    {
        $this->module = Module::with(['questions' => function ($query) {
            $query->orderBy('id', 'asc');
        }])->findOrFail($moduleId);
    }
    
    /**
    * @param Collection $collection
    */
    public function collection(Collection $rows)
    {
        $questions = $this->module->questions;

        $questionIds = $questions->pluck('id');

        if ($questionIds->isNotEmpty()) {
            Answer::whereIn('question_id', $questionIds)
                  ->where('source', 'gform')
                  ->delete();
        }

        foreach ($rows->skip(1) as $row) {
            try {
                $mainTimestamp = $this->parseExcelDateTime($row[0]);
                if (!$mainTimestamp) {
                    Log::warning('GFORM IMPORT: Could not parse main timestamp.', ['row' => $row->toArray()]);
                    continue;
                }

                $email = strtolower(trim($row[1] ?? ''));
                if (empty($email)) continue;

                $user = User::where('email', $email)->first();
                if (!$user) {
                    Log::warning('GFORM IMPORT: User not found with email: ' . $email);
                    continue;
                }
// start kolom ke 5 
// tiap question ada 3 inputan (time start, jawaban, time end)
                foreach ($questions as $index => $question) {
                    $startColumnIndex = 5 + ($index * 3); // di foreach jadi indexnya +3+3 terus
                    $answerColumnIndex = $startColumnIndex + 1;
                    $finishColumnIndex = $startColumnIndex + 2;

                    if (!isset($row[$answerColumnIndex])) {
                        continue;
                    }

                    $studentAnswer = $row[$answerColumnIndex] ?? '';
                    
                    $startTimeValue = $row[$startColumnIndex] ?? null;
                    $finishTimeValue = $row[$finishColumnIndex] ?? null;

                    $fullStartTime = $this->combineDateAndTime($mainTimestamp, $startTimeValue);
                    $fullFinishTime = $this->combineDateAndTime($mainTimestamp, $finishTimeValue);

                    Answer::create([
                        'question_id' => $question->id,
                        'user_id' => $user->id,
                        'source' => 'gform',
                        'student_code' => $studentAnswer,
                        'total_score' => null,
                        'structure_score' => null,
                        'output_accuracy_score' => null,
                        'started_at' => $fullStartTime,
                        'finished_at' => $fullFinishTime,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('GFORM IMPORT: Failed to process row. Error: ' . $e->getMessage(), ['row_data' => json_encode($row)]);
                continue;
            }
        }
    }

    public function chunkSize(): int
    {
        return 100;
    }

    private function parseExcelDateTime($excelTimestamp): ?Carbon
    {
        if (!is_numeric($excelTimestamp)) {
            try {
                return Carbon::parse($excelTimestamp);
            } catch (\Exception $e) {
                return null;
            }
        }

        $unixTimestamp = ($excelTimestamp - 25569) * 86400;
        return Carbon::createFromTimestamp($unixTimestamp);
    }

    /**
     * Helper function to combine a base date with an Excel time fraction.
     */
    private function combineDateAndTime(Carbon $baseDate, $excelTimeFraction): Carbon
    {
        if (!is_numeric($excelTimeFraction)) {
            return $baseDate;
        }
        $secondsIntoDay = $excelTimeFraction * 86400;
        
        return $baseDate->clone()->startOfDay()->addSeconds($secondsIntoDay);
    }
}
