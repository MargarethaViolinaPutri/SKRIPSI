<?php

namespace App\Contract\Master;

use App\Contract\BaseContract;

interface QuestionContract extends BaseContract
{
    public function createMultiple(array $base, array $questions);
}