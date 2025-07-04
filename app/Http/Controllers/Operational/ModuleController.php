<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\ModuleContract;
use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;

class ModuleController extends Controller
{
    protected ModuleContract $service;

    public function __construct(ModuleContract $service)
    {
        $this->service = $service;
    }

    public function fetch(): JsonResponse
    {
        $result = $this->service->all(
            filters: [
                'name', 
                AllowedFilter::exact('course_id'),
            ],
            sorts: ['name','created_at'],
            paginate: true,
            relation: [
                'questions' => function ($query) {
                    $query->withCount('userAnswers');
                },
                'questions.userAnswer',
                'questions.userAnswers',
            ],
            perPage: request()->get('per_page', 10)
        );
        $modules = collect($result['items']);

        $modules->each(function ($module) {
            $module->makeHidden('questions');

            $module->makeHidden(['material_paths', 'created_at', 'updated_at']);
        });
        $result['items'] = $modules->all();

        $processedModules = $modules->map(function ($module) {
            $module->is_locked = $this->service->isLocked($module);
            return $module;
        });
        $result['items'] = $processedModules->all();

        return response()->json($result);
    }

    public function show($id)
    {
        $module = Module::with('course')->findOrFail($id);

        $course = $module->course;

        $classification = DB::table('course_user')->where('course_id', $module->course_id)->where('user_id', Auth::id())->first();
        abort_if($classification && $classification->class_group === User::GROUP_CON, 403, 'Your pre-test score allows you to skip the modules.');
        
        $pretest = Test::where('course_id', $course->id)->where('type', Test::PRE_TEST)->where('status', 'published')->first();
        if ($pretest) {
            $hasCompletedPretest = TestAttempt::where('test_id', $pretest->id)
                ->where('user_id', Auth::id())
                ->whereNotNull('finished_at')
                ->exists();

            abort_if(!$hasCompletedPretest, 403, 'Please complete the pre-test for this course to access the modules.');
        }
        
        if ($this->service->isLocked($module)) {
            return Inertia::render('error/moduleLocked', [
                'module' => $module
            ]);
        }

        return Inertia::render('operational/question/index', [
            'module' => $module
        ]);
    }

    public function showMaterial($id)
    {
        $module = Module::findOrFail($id);

        return Inertia::render('operational/module/material', [
            'module' => $module,
        ]);
    }
}
