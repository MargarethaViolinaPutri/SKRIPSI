<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\TestQuestionRequest;
use App\Models\Test;
use App\Models\TestQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TestQuestionController extends Controller
{
    public function store(Request $request, Test $test)
    {
        Log::info('TestQuestionController@store called with data:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'code' => 'required|string',
            'test' => 'required|string',
        ]);

        $question = $test->question()->updateOrCreate(
            ['test_id' => $test->id],
            [
                'name' => $validated['name'],
                'desc' => $validated['desc'],
                'code' => $validated['code'],
                'test' => $validated['test'],
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Question saved successfully.',
                'question' => $question,
            ]);
        }

        return redirect()->route('master.test.index')->with('success', 'Question saved successfully.');
    }

    public function destroy(Test $test, TestQuestion $question)
    {
        $question->delete();
        return redirect()->route('master.test.show', $test->id)->with('success', 'Question deleted successfully.');
    }
}