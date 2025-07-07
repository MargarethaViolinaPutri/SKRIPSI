<?php

namespace App\Service\Master;

use App\Contract\Master\CourseContract;
use App\Models\Course;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\User;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

    public function getUserClassGroup(Course $course): ?string
    {
        $classification = DB::table('course_user')
            ->where('course_id', $course->id)
            ->where('user_id', Auth::id())
            ->first();
        return $classification ? $classification->class_group : null;
    }
    
    public function getAverageScoreAndStudentCount(int $courseId): array
    {
        $pretest = Test::where('course_id', $courseId)->where('type', Test::PRE_TEST)->first();

        if (!$pretest) {
            return ['average_score' => 0, 'student_count' => 0];
        }

        $result = DB::table('test_attempts')
            ->where('test_id', $pretest->id)
            ->whereNotNull('finished_at')
            ->selectRaw('AVG(total_score) as average_score, COUNT(DISTINCT user_id) as student_count')
            ->first();

        return [
            'average_score' => $result->average_score ?? 0,
            'student_count' => $result->student_count ?? 0,
        ];
    }

    public function getTestProgress(int $courseId): array
    {
        $totalStudents = User::whereHas('roles', function ($query) {
            $query->where('name', 'student');
        })->count();

        $pretest = Test::where('course_id', $courseId)->where('type', Test::PRE_TEST)->first();

        if (!$pretest) {
            return ['total_students' => $totalStudents, 'students_tested' => 0];
        }

        $studentsTested = DB::table('test_attempts')
            ->where('test_id', $pretest->id)
            ->whereNotNull('finished_at')
            ->distinct('user_id')
            ->count('user_id');

        return [
            'total_students' => $totalStudents,
            'students_tested' => $studentsTested,
        ];
    }

    public function getStudentTestDetails(int $courseId): Collection
    {
        $pretest = Test::where('course_id', $courseId)->where('type', Test::PRE_TEST)->first();

        if (!$pretest) {
            return collect();
        }

        return DB::table('test_attempts')
            ->where('test_attempts.test_id', $pretest->id)
            ->whereNotNull('test_attempts.finished_at')
            ->join('users', 'test_attempts.user_id', '=', 'users.id')
            ->leftJoin('course_user', function ($join) use ($courseId) {
                $join->on('users.id', '=', 'course_user.user_id')
                     ->where('course_user.course_id', '=', $courseId);
            })
            ->select(
                'users.id',
                'users.name',
                'test_attempts.total_score',
                'course_user.class_group',
                'course_user.stratum'
            )
            
            ->orderByDesc('test_attempts.total_score')
            ->get();
    }

    public function classifyStudentsByThreshold(Course $course): void
    {
        if (is_null($course->threshold)) {
            return;
        }

        $pretest = Test::where('course_id', $course->id)->where('type', Test::PRE_TEST)->first();
        if (!$pretest) {
            return;
        }

        $attempts = TestAttempt::where('test_id', $pretest->id)
            ->whereNotNull('finished_at')
            ->get(['user_id', 'total_score'])
            ->keyBy('user_id');

        $enrolledStudents = DB::table('course_user')
            ->where('course_id', $course->id)
            ->get()
            ->keyBy('user_id');

        $dataToUpsert = [];

        $groupCounts = [
            'high' => ['control' => 0, 'experiment' => 0],
            'low' => ['control' => 0, 'experiment' => 0],
        ];

        foreach ($enrolledStudents as $userId => $student) {
            if ($student->class_group && $student->stratum) {
                $groupCounts[$student->stratum][$student->class_group]++;
            }
        }

        foreach ($attempts as $userId => $attempt) {
            $newStratum = $attempt->total_score >= $course->threshold ? User::STRATUM_HIGH : User::STRATUM_LOW;
            
            $existingClassification = $enrolledStudents->get($userId);
            
            $classGroup = null;
            if ($existingClassification && $existingClassification->class_group) {
                $classGroup = $existingClassification->class_group;
            } else {
                if ($groupCounts[$newStratum][User::GROUP_CON] <= $groupCounts[$newStratum][User::GROUP_EXP]) {
                    $classGroup = User::GROUP_CON;
                    $groupCounts[$newStratum][User::GROUP_CON]++;
                } else {
                    $classGroup = User::GROUP_EXP;
                    $groupCounts[$newStratum][User::GROUP_EXP]++;
                }
            }

            $dataToUpsert[] = [
                'course_id' => $course->id,
                'user_id' => $userId,
                'stratum' => $newStratum,
                'class_group' => $classGroup,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($dataToUpsert)) {
            DB::table('course_user')->upsert(
                $dataToUpsert,
                ['course_id', 'user_id'],
                ['stratum', 'class_group', 'updated_at']
            );
        }
    }
}
