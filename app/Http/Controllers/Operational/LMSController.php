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
            'modules',
            'tests' => function ($query) {
                $query->where('status', 'published')->with('userLatestCompletedAttempt');
            }
        ])->findOrFail($id);
        
        $classification = DB::table('course_user')
            ->where('course_id', $course->id)
            ->where('user_id', $userId)
            ->first();
        $classGroup = $classification ? $classification->class_group : null;
        
        $pretest = $course->tests->firstWhere('type', Test::PRE_TEST);
        $hasCompletedPretest = !$pretest || ($pretest->userLatestCompletedAttempt !== null);

        $areModulesUnlocked = $hasCompletedPretest && ($classGroup === User::GROUP_EXP);

        $allModulesCompleted = $this->service->areAllModulesCompleted($course);

        $completedTestTypes = $course->tests
            ->whereNotNull('userLatestCompletedAttempt')
            ->pluck('type')
            ->unique()
            ->toArray();

        $processedTests = $course->tests->map(function ($test) use ($completedTestTypes, $allModulesCompleted, $classGroup) {
            
            $test->is_locked_by_sequence = false;
            $currentTestTypeIndex = array_search($test->type, $this->testSequence);
            if ($currentTestTypeIndex > 0) {
                $prerequisiteType = $this->testSequence[$currentTestTypeIndex - 1];
                if (!in_array($prerequisiteType, $completedTestTypes)) {
                    $test->is_locked_by_sequence = true;
                }
            }

            $test->is_locked_by_modules = false;
            if (in_array($test->type, [Test::POST_TEST, Test::DELAY_TEST])) {
                if ($classGroup === User::GROUP_EXP && !$allModulesCompleted) {
                    $test->is_locked_by_modules = true;
                }
            }

            $isWithinSchedule = $test->available_from ? now()->isBetween($test->available_from, $test->available_until) : true;
            $isAlreadyCompleted = $test->userLatestCompletedAttempt !== null;
            $test->is_visible = $isWithinSchedule || $isAlreadyCompleted;

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