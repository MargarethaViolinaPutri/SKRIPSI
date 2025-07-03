<?php

namespace App\Service\Master;

use App\Contract\Master\CourseContract;
use App\Models\Course;
use App\Service\BaseService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    public function getAverageScoreAndStudentCount(): array
    {
        $result = DB::table('test_attempts')
            ->join('users', 'test_attempts.user_id', '=', 'users.id')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'student')
            ->selectRaw('AVG(test_attempts.total_score) as average_score, COUNT(DISTINCT users.id) as student_count')
            ->first();

        return [
            'average_score' => $result->average_score ?? 0,
            'student_count' => $result->student_count ?? 0,
        ];
    }

    public function getTestProgress(): array
    {
        $totalStudents = DB::table('users')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'student')
            ->count();

        $studentsTested = DB::table('test_attempts')
            ->join('users', 'test_attempts.user_id', '=', 'users.id')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'student')
            ->distinct('test_attempts.user_id')
            ->count('test_attempts.user_id');

        return [
            'total_students' => $totalStudents,
            'students_tested' => $studentsTested,
        ];
    }

    public function getStudentTestDetails(int $courseId): array
    {
        $results = DB::table('test_attempts')
            ->join('users', 'test_attempts.user_id', '=', 'users.id')
            ->join('course_user', 'users.id', '=', 'course_user.user_id')
            ->select('users.id', 'users.name', 'test_attempts.total_score', 'course_user.class_group')
            ->where('course_user.course_id', $courseId)
            ->get();

        return $results->toArray();
    }
}
