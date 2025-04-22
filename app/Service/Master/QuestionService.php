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
}
