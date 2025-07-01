<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClassRoomRequest extends FormRequest
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
        $rules = [];

        if ($this->isMethod('post')) {
            $rules['user_id'] = 'required|integer|exists:users,id';
            $rules['name'] = 'required|string|max:255';
            $rules['members'] = 'required|array';
            $rules['members.*.value'] = 'required|integer|exists:users,id';
        } else {
            $rules['user_id'] = 'sometimes|integer|exists:users,id';
            $rules['name'] = 'sometimes|string|max:255';
            $rules['members'] = 'sometimes|array';
            $rules['members.*.value'] = 'sometimes|integer|exists:users,id';
        }

        return $rules;
    }
}
