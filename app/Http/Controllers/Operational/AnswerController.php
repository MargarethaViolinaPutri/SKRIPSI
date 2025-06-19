<?php

namespace App\Http\Controllers\Operational;

use App\Http\Controllers\Controller;
use App\Service\Operational\AnswerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    protected AnswerService $answerService;

    public function __construct(AnswerService $answerService)
    {
        $this->answerService = $answerService;
    }

    /**
     * Assessing students' answers and saving the results
     *
     * @param  Request  $request
     * @param  int  $questionId
     * @return \Illuminate\Http\Response
     */
    public function evaluateAnswer(Request $request, int $questionId)
    {
        $validated = $request->validate([
            'student_code' => 'required|string',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s',
        ]);

        // $userId = Auth::id();
        $userId = 3;

        try {
            $answer = $this->answerService->evaluateAndSaveAnswer(
                $questionId, $userId, $validated['student_code'], $validated['start_time'], $validated['end_time']
            );

            return response()->json([
                'message' => 'Answer successfully evaluated.',
                'data' => $answer,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while evaluating the answer.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
