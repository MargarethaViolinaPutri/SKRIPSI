<?php

namespace App\Contract\Master;

use App\Contract\BaseContract;
use App\Models\Course;
use Illuminate\Support\Collection;

interface CourseContract extends BaseContract {
    public function areAllModulesCompleted(Course $course): bool;
    public function getAverageScoreAndStudentCount(int $courseId): array;
    public function getTestProgress(int $courseId): array;
    public function getStudentTestDetails(int $courseId): Collection;
    public function classifyStudentsByThreshold(Course $course): void;
}