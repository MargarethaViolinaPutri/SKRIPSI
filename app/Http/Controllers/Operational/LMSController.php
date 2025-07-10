<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Master\CourseContract;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Test;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LMSController extends Controller
{
    protected CourseContract $service;
    private $testSequence = [Test::PRE_TEST, Test::POST_TEST, Test::DELAY_TEST];

    public function __construct(CourseContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('operational/lms/index');
    }

    public function fetch()
    {
        $user = User::find(Auth::id());
        $classroom = $user->classRooms()->latest()->first();

        $data = $this->service->all(
            filters: ['name'],
            sorts: ['name'],
            paginate: true,
            conditions: [
                ['class_room_id', '=', $classroom->id],
            ],
            perPage: request()->get('per_page', 10),
        );

        return response()->json($data);
    }

    public function show($id)
    {
        $userId = Auth::id();
        $course = Course::with([
            'modules.questions' => function ($query) {
                $query->with('userAnswers')->withCount('userAnswers');
            },
            'tests' => function ($query) {
                $query->where('status', 'published')->with('userCompletedAttempts');
            }
        ])->findOrFail($id);
        
        $classGroup = $this->service->getUserClassGroup($course);
        
        $completedTestTypes = $course->tests->map(function ($test) {
            return $test->userCompletedAttempts->isNotEmpty() ? $test->type : null;
        })->filter()->unique()->toArray();

        $hasCompletedPretest = in_array(Test::PRE_TEST, $completedTestTypes);

        $areModulesUnlocked = $hasCompletedPretest && ($classGroup === User::GROUP_EXP);

        $allModulesCompleted = ($classGroup === 'control') ? true : $this->service->areAllModulesCompleted($course);

        $processedTests = $course->tests->map(function ($test) use ($completedTestTypes, $allModulesCompleted, $classGroup) {
            
            $latestAttempt = $test->userCompletedAttempts->sortByDesc('id')->first();

            $test->user_latest_completed_attempt = $latestAttempt;

            if ($latestAttempt) {
                $test->is_locked = false;
                $test->is_visible = true;
                return $test;
            }

            $isLockedBySequence = false;
            $currentTestTypeIndex = array_search($test->type, $this->testSequence);
            if ($currentTestTypeIndex > 0) {
                $prerequisiteType = $this->testSequence[$currentTestTypeIndex - 1];
                if (!in_array($prerequisiteType, $completedTestTypes)) {
                    $isLockedBySequence = true;
                }
            }

            $isLockedByModules = false;
            if (in_array($test->type, [Test::POST_TEST, Test::DELAY_TEST]) && !$allModulesCompleted) {
                $isLockedByModules = true;
            }

            $test->is_locked = $isLockedBySequence || $isLockedByModules;

            $test->is_visible = $test->available_from ? now()->isBetween($test->available_from, $test->available_until) : true;
            
            return $test;

        })->filter(function ($test) {
            return $test->is_visible;
        });

        return Inertia::render('operational/module/index', [
            'course' => $course,
            'modules' => $course->modules,
            'availableTests' => $processedTests->values(),
            'areModulesUnlocked' => $areModulesUnlocked,
            'classGroup' => $classGroup,
        ]);
    }
}