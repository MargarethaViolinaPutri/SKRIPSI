<?php

namespace App\Service\Master;

use App\Contract\Master\QuestionContract;
use App\Models\Question;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class QuestionService extends BaseService implements QuestionContract
{
    protected Model $model;

    public function __construct(Question $model)
    {
        $this->model = $model;
    }

    public function createMultiple(array $base, array $questions)
    {
        foreach ($questions as $q) {
            $this->create([
                'module_id' => $base['module_id'],
                'name' => $base['name'] . ' - Soal ' . $q['question_number'],
                'desc' => $q['narasi'],
                'code' => $q['kode_blank'],
                'test' => $q['kode_utuh'],
            ]);
        }

        return true;
    }

}