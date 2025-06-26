<?php
namespace App\Service\Master;
use App\Contract\Master\TestQuestionContract;
use App\Models\TestQuestion;
use App\Service\BaseService;

class TestQuestionService extends BaseService implements TestQuestionContract
{
    public function __construct(TestQuestion $model)
    {
        parent::__construct($model);
    }
}