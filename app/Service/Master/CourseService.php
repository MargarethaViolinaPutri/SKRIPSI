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
// File ini adalah implementasi dari CourseContract, menggunakan Laravel Service Pattern, dan berfungsi sebagai service layer untuk mengelola logika bisnis terkait Course.
class CourseService extends BaseService implements CourseContract
{
    protected Model $model;

    public function __construct(Course $model)
    {
        $this->model = $model;
    }
// Mengecek apakah semua modul telah dikerjakan dan lulus (≥ 80).
// Digunakan untuk mengunci/menyembunyikan post-test dan delay-test.
// Return: true jika semua modul lengkap dan lulus.
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
// Mengambil class_group siswa (control atau experiment) dari tabel course_user.
// Penting untuk menentukan apakah siswa boleh membuka konten eksperimen.
    public function getUserClassGroup(Course $course): ?string
    {
        $classification = DB::table('course_user')
            ->where('course_id', $course->id)
            ->where('user_id', Auth::id())
            ->first();
        return $classification ? $classification->class_group : null;
    }
// Menghitung rata-rata nilai pre-test dan jumlah siswa yang sudah mengerjakan.
// Sumber data dari tabel test_attempts.
// Digunakan untuk membantu guru menetapkan threshold.    
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
// Berapa siswa yang sudah mengerjakan pre-test (ada finished_at)
// Dipakai untuk progres bar / visualisasi progres pengisian pre-test.
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
// Mengembalikan daftar siswa: Digunakan untuk menampilkan tabel klasifikasi siswa sebelum dan sesudah threshold ditentukan.
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
        if (is_null($course->threshold)) { // Ambil threshold & pre-test
            return;
        }
// Mengecek apakah threshold sudah diset dan pre-test tersedia. Kalau belum, fungsi langsung dihentikan (return).
        $pretest = Test::where('course_id', $course->id)->where('type', Test::PRE_TEST)->first();
        if (!$pretest) {
            return;
        }
// Ambil semua skor siswa dari pre-test
        $attempts = TestAttempt::where('test_id', $pretest->id)
            ->whereNotNull('finished_at')
            ->get(['user_id', 'total_score']) // Mengambil user_id serta total_score.
            ->keyBy('user_id'); // Hasilnya disimpan di $attempts, dengan user_id sebagai kunci.
// Ambil daftar siswa yang terdaftar di course
        $enrolledStudents = DB::table('course_user')
            ->where('course_id', $course->id)
            ->get()
            ->keyBy('user_id');

        $dataToUpsert = [];
// Hitung jumlah siswa per kombinasi stratum + class_group
        $groupCounts = [
            'high' => ['control' => 0, 'experiment' => 0],
            'low' => ['control' => 0, 'experiment' => 0],
        ];

        foreach ($enrolledStudents as $userId => $student) {
            if ($student->class_group && $student->stratum) {
                $groupCounts[$student->stratum][$student->class_group]++;
            }
        } // ---above--- Mengecek apakah siswa sudah pernah diklasifikasi sebelumnya. Jika ya, hitung jumlah mereka untuk distribusi seimbang nanti.
// Penentuan stratum & class_group per siswa
        foreach ($attempts as $userId => $attempt) {
            // ditentukan berdasarkan perbandingan skor siswa dengan threshold.
            $newStratum = $attempt->total_score >= $course->threshold ? User::STRATUM_HIGH : User::STRATUM_LOW;
            // jika siswa sudah ada di course_user, dan sudah punya class_group, maka gunakan nilai itu (tidak diubah).
            $existingClassification = $enrolledStudents->get($userId);
// Jika belum punya class_group, maka:
// Lihat jumlah experiment dan control di strata yang sama.
// Tambahkan siswa ke grup yang masih lebih sedikit, agar seimbang            
            $classGroup = null;
            if ($existingClassification && $existingClassification->class_group) {
                $classGroup = $existingClassification->class_group;
            } else {
                if ($groupCounts[$newStratum][User::GROUP_EXP] <= $groupCounts[$newStratum][User::GROUP_CON]) {
                    $classGroup = User::GROUP_EXP;
                    $groupCounts[$newStratum][User::GROUP_EXP]++;
                } else {
                    $classGroup = User::GROUP_CON;
                    $groupCounts[$newStratum][User::GROUP_CON]++;
                }
            }
// Menyimpan data siswa (course_id, user_id, stratum, class_group) dalam array $dataToUpsert.
            $dataToUpsert[] = [
                'course_id' => $course->id,
                'user_id' => $userId,
                'stratum' => $newStratum,
                'class_group' => $classGroup,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
// Upsert ke tabel course_user
// Jika data dengan kombinasi course_id + user_id sudah ada → update stratum, class_group, updated_at
// Jika belum → insert baru
        if (!empty($dataToUpsert)) {
            DB::table('course_user')->upsert(
                $dataToUpsert,
                ['course_id', 'user_id'],
                ['stratum', 'class_group', 'updated_at']
            );
        }
    }

    public function getStratumGroupCounts(int $courseId): array
    {
        $counts = [
            'high' => ['control' => 0, 'experiment' => 0],
            'low' => ['control' => 0, 'experiment' => 0],
        ];

        $results = DB::table('course_user')
            ->where('course_id', $courseId)
            ->whereNotNull('stratum')
            ->whereNotNull('class_group')
            ->select('stratum', 'class_group', DB::raw('COUNT(user_id) as count'))
            ->groupBy('stratum', 'class_group')
            ->get();

        foreach ($results as $result) {
            if (isset($counts[$result->stratum][$result->class_group])) {
                $counts[$result->stratum][$result->class_group] = $result->count;
            }
        }

        return $counts;
    }
}
