<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFibRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'module_id' => 'required|exists:modules,id',
            'name' => 'required|string',
            'desc' => 'nullable|string',
            'questions' => 'required|array|min:1',
            'questions.*.narasi' => 'required|string',
            'questions.*.kode_blank' => 'required|string',
            'questions.*.kode_utuh' => 'required|string',
            'questions.*.test' => 'required|string',
        ];
    }

}
