<?php

namespace App\Service\Operational;

use App\Contract\Operational\ModuleContract;
use App\Models\Module;
use App\Models\Setting;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;

class ModuleService extends BaseService implements ModuleContract
{
    protected Model $model;

    public function __construct(Module $model)
    {
        $this->model = $model;
    }

    public function isLocked(Module $module): bool
    {
        $previousModule = Module::where('course_id', $module->course_id)
                                ->where('id', '<', $module->id)
                                ->orderBy('id', 'desc')
                                ->first();

        if (!$previousModule) {
            return false;
        }

        $previousModule->load('questions.userAnswer');
        $performance = $previousModule->getPerformanceAttribute();

        if (!$performance) {
            return true;
        }

        $progress = ($performance['questions_answered'] / $performance['total_questions']) * 100;
        $score = $performance['average_score'];

        if ($progress >= 100 && $score >= Setting::MIN_SCORE) {
            return false;
        }

        return true;
    }
}