<?php

namespace App\Service\Master;

use App\Contract\Master\CourseContract;
use App\Models\Course;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class CourseService extends BaseService implements CourseContract
{
    protected Model $model;

    public function __construct(Course $model)
    {
        $this->model = $model;
    }
}