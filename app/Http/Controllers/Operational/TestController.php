<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Master\CourseContract;
use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TestController extends Controller
{
    protected CourseContract $service;

    public function __construct(CourseContract $service)
    {
        $this->service = $service;
    }

    public function start(Test $test)
    {
        if ($test->status !== 'published' || ($test->available_from && !now()->isBetween($test->available_from, $test->available_until))) {
            abort(403, 'This test is not available.');
        }

        if (in_array($test->type, ['posttest', 'delaytest'])) {
            $allModulesCompleted = $this->service->areAllModulesCompleted($test->course);
            abort_if(!$allModulesCompleted, 403, 'You must complete all modules with a score of 80+ to start this test.');
        }

        $existingAttempt = TestAttempt::where('test_id', $test->id)
                                      ->where('user_id', Auth::id())
                                      ->whereNotNull('finished_at')
                                      ->exists();

        abort_if($existingAttempt, 403, 'You have already completed this test and cannot retake it.');

        $questionIds = $test->questions()->pluck('id');

        $shuffledIds = $questionIds->shuffle();

        $attempt = TestAttempt::create([
            'test_id' => $test->id,
            'user_id' => Auth::id(),
            'started_at' => now(),
            'question_order' => $shuffledIds,
        ]);

        return redirect()->route('operational.test.take', ['attempt' => $attempt->id]);
    }

    public function take(TestAttempt $attempt)
    {
        abort_if($attempt->user_id !== Auth::id() || $attempt->finished_at, 403);
        
        $questionOrder = $attempt->question_order;

        if (empty($questionOrder)) {
            $attempt->load('test.questions.options');
        } else {
            $attempt->load(['test.questions' => function ($query) use ($questionOrder) {
                $orderString = implode(',', $questionOrder);
                $query->with('options')->orderByRaw("FIELD(id, $orderString)");
            }]);
        }

        $questionsForStudent = $attempt->test->questions->map(function ($question) {
            $publicOptions = $question->options->map(function ($option) {
                return [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                ];
            });
            
            $question->setRelation('options', $publicOptions);
            
            unset($question->test_id);

            return $question;
        });

        $attempt->test->setRelation('questions', $questionsForStudent);

        return Inertia::render('operational/test/take', [
            'attempt' => $attempt,
        ]);
    }

    public function submit(Request $request, TestAttempt $attempt)
    {
        abort_if($attempt->user_id !== Auth::id() || $attempt->finished_at, 403);

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required|integer|exists:test_question_options,id'
        ]);

        $submittedAnswers = $validated['answers'];
        
        $test = $attempt->test()->with('questions:id,test_id')->first();
        
        $totalQuestionsInTest = $test->questions->count();

        $correctAnswersCount = 0;

        if (!empty($submittedAnswers)) {
            $correctOptionIds = \App\Models\TestQuestionOption::whereIn('test_question_id', $test->questions->pluck('id'))
                ->where('is_correct', true)
                ->pluck('id');

            foreach ($submittedAnswers as $questionId => $submittedOptionId) {
                if ($correctOptionIds->contains($submittedOptionId)) {
                    $correctAnswersCount++;
                }
            }
        }
        
        if (!empty($submittedAnswers)) {
            $answersData = [];
            foreach($submittedAnswers as $questionId => $optionId) {
                $answersData[] = [
                    'test_attempt_id' => $attempt->id,
                    'test_question_id' => $questionId,
                    'test_question_option_id' => $optionId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            TestAnswer::insert($answersData);
        }

        $score = ($totalQuestionsInTest > 0) ? ($correctAnswersCount / $totalQuestionsInTest) * 100 : 0;

        $attempt->update([
            'score' => $score,
            'finished_at' => now(),
        ]);

        return redirect()->route('operational.test.result', ['attempt' => $attempt->id]);
    }

    public function result(TestAttempt $attempt)
    {
        abort_if($attempt->user_id !== Auth::id(), 403);
        
        $attempt->load('test.questions.options', 'answers.option');

        return Inertia::render('operational/test/result', [
            'attempt' => $attempt,
        ]);
    }
}
