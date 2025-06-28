<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\TestQuestionRequest;
use App\Models\Test;
use App\Models\TestQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestQuestionController extends Controller
{
    public function store(TestQuestionRequest $request, Test $test)
    {
        DB::transaction(function () use ($request, $test) {
            $validated = $request->validated();

            $questionData = [
                'question_text' => $validated['question_text'],
            ];
            
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('test_question_images', 'public');
                $questionData['image_path'] = $path;
            }

            $question = $test->questions()->create($questionData);

            foreach ($validated['options'] as $index => $optionData) {
                $question->options()->create([
                    'option_text' => $optionData['option_text'],
                    'is_correct' => ($index == $validated['correct_option_index']),
                ]);
            }
        });
        return redirect()->route('master.test.show', $test->id)->with('success', 'Question added successfully.');
    }

    public function destroy(Test $test, TestQuestion $question)
    {
        $question->delete();
        return redirect()->route('master.test.show', $test->id)->with('success', 'Question deleted successfully.');
    }
}
