<?php

namespace App\Service\Master;

use App\Contract\Master\TestContract;
use App\Models\Test;
use App\Service\BaseService;

class TestService extends BaseService implements TestContract
{
    public function __construct(Test $model)
    {
        parent::__construct($model);
    }
}