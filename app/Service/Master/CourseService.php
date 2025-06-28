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

    public function areAllModulesCompleted(Course $course): bool
    {
        $course->load(['modules.questions' => function ($query) {
            $query->withCount('userAnswers')->with('userAnswer');
        }]);

        if ($course->modules->isEmpty()) {
            return true;
        }

        foreach ($course->modules as $module) {
            $performance = $module->getPerformanceAttribute();

            if (!$performance) {
                return false;
            }

            $isCompleted = ($performance['questions_answered'] === $performance['total_questions']);
            $isPassed = ($performance['average_score'] >= 80);

            if (!$isCompleted || !$isPassed) {
                return false;
            }
        }

        return true;
    }
}