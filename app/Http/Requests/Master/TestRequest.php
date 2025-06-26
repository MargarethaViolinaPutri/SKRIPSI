<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['pretest', 'posttest', 'delaytest'])],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'duration_in_minutes' => 'nullable|integer|min:1',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
        ];
    }
}
