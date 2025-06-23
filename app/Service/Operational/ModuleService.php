<?php

namespace App\Service\Operational;

use App\Contract\Operational\ModuleContract;
use App\Models\Module;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class ModuleService extends BaseService implements ModuleContract
{
    protected Model $model;

    public function __construct(Module $model)
    {
        $this->model = $model;
    }

}