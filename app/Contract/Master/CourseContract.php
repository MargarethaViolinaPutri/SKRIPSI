<?php 

namespace App\Contract\Master;

use App\Contract\BaseContract;
use App\Models\Course;

interface CourseContract extends BaseContract {
    public function areAllModulesCompleted(Course $course): bool;
}