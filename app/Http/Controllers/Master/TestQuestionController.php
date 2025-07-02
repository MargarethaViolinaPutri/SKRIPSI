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
    public function store(Request $request, Test $test)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'code' => 'required|string',
            'test' => 'required|string',
        ]);

        $test->question()->updateOrCreate(
            ['test_id' => $test->id],
            [
                'name' => $validated['name'],
                'desc' => $validated['desc'],
                'code' => $validated['code'],
                'test' => $validated['test'],
            ]
        );

        return redirect()->route('master.test.show', $test->id)->with('success', 'Question saved successfully.');
    }

    public function destroy(Test $test, TestQuestion $question)
    {
        $question->delete();
        return redirect()->route('master.test.show', $test->id)->with('success', 'Question deleted successfully.');
    }
}
