<?php

namespace App\Service\Operational;

use App\Contract\Operational\QuestionContract;
use App\Models\Question;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class QuestionService extends BaseService implements QuestionContract
{
    protected Model $model;
    
    public function __construct(Question $model)
    {
        parent::__construct($model);
    }
}