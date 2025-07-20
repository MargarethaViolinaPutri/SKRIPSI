<?php

namespace App\Http\Controllers\Report;

use App\Exports\ModuleReportExport;
use App\Exports\StudentReportExport;
use App\Exports\TestReportExport;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function testReport(Request $request)
    {
        $courses = Course::orderBy('name')->get(['id', 'name']);
        
        $filters = $request->only(['course_id', 'name', 'class_group']);
        
        $selectedCourseId = ($filters['course_id'] ?? null) && $filters['course_id'] !== 'all' ? (int)$filters['course_id'] : null;
        $searchTerm = $filters['name'] ?? null;
        $selectedGroup = ($filters['class_group'] ?? null) && $filters['class_group'] !== 'all' ? $filters['class_group'] : null;

        $reportData = (new TestReportExport($selectedCourseId, $searchTerm, $selectedGroup))->collection();
        
        return Inertia::render('report/test', [
            'reportData' => $reportData,
            'courses' => $courses,
            'filters' => $filters,
        ]);
    }

    public function exportTestReport(Request $request)
    {
        $selectedCourseId = $request->input('course_id') && $request->input('course_id') !== 'all' ? (int)$request->input('course_id') : null;
        $searchTerm = $request->input('name');
        $selectedGroup = $request->input('class_group') && $request->input('class_group') !== 'all' ? $request->input('class_group') : null;

        $fileName = 'test_report_' . now()->format('Y-m-d') . '.xlsx';
        
        return Excel::download(new TestReportExport($selectedCourseId, $searchTerm, $selectedGroup), $fileName);
    }

    public function moduleReport(Request $request)
    {
        $courses = Course::orderBy('name')->get(['id', 'name']);
        $filters = $request->only(['course_id', 'name', 'class_group']);
        
        $selectedCourseId = ($filters['course_id'] ?? null) && $filters['course_id'] !== 'all' ? (int)$filters['course_id'] : null;
        $searchTerm = $filters['name'] ?? null;
        $selectedGroup = ($filters['class_group'] ?? null) && $filters['class_group'] !== 'all' ? $filters['class_group'] : null;

        $reportData = $selectedCourseId 
            ? (new ModuleReportExport($selectedCourseId, $searchTerm, $selectedGroup))->collection()
            : collect();
        
        return Inertia::render('report/module', [
            'reportData' => $reportData,
            'courses' => $courses,
            'filters' => [
                'course_id' => $selectedCourseId,
                'name' => $searchTerm,
            ],
        ]);
    }

    public function exportModuleReport(Request $request)
    {
        $selectedCourseId = $request->input('course_id') && $request->input('course_id') !== 'all' ? (int)$request->input('course_id') : null;
        $searchTerm = $request->input('name');
        $selectedGroup = $request->input('class_group') && $request->input('class_group') !== 'all' ? $request->input('class_group') : null;

        abort_if(!$selectedCourseId, 400, 'Please select a course to export.');

        $fileName = 'module_report_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new ModuleReportExport($selectedCourseId, $searchTerm, $selectedGroup), $fileName);
    }

    public function studentReport(Request $request)
    {
        $courses = Course::orderBy('name')->get(['id', 'name']);
        
        $filters = $request->only(['course_id', 'module_id', 'user_id']);
        
        $selectedCourseId = ($filters['course_id'] ?? null) && $filters['course_id'] !== 'all' ? (int)$filters['course_id'] : null;
        $selectedModuleId = ($filters['module_id'] ?? null) && $filters['module_id'] !== 'all' ? (int)$filters['module_id'] : null;
        $selectedUserId = ($filters['user_id'] ?? null) && $filters['user_id'] !== 'all' ? (int)$filters['user_id'] : null;

        $modules = collect();
        if ($selectedCourseId) {
            $modules = Module::where('course_id', $selectedCourseId)->orderBy('name')->get(['id', 'name']);
        }

        $students = collect();
        if ($selectedCourseId) {
            $students = User::whereHas('courses', fn($q) => $q->where('course_id', $selectedCourseId))
                ->orderBy('name')
                ->get(['id', 'name']);
        }

        $reportData = $selectedCourseId
            ? (new StudentReportExport($selectedCourseId, $selectedModuleId, $selectedUserId))->collection()
            : collect();
        
        return Inertia::render('report/student', [
            'reportData' => $reportData,
            'courses' => $courses,
            'modules' => $modules,
            'students' => $students,
            'filters' => $filters,
        ]);
    }

    public function exportStudentReport(Request $request)
    {
        $selectedCourseId = $request->input('course_id') && $request->input('course_id') !== 'all' ? (int)$request->input('course_id') : null;
        $selectedModuleId = $request->input('module_id') && $request->input('module_id') !== 'all' ? (int)$request->input('module_id') : null;
        $selectedUserId = $request->input('user_id') && $request->input('user_id') !== 'all' ? (int)$request->input('user_id') : null;

        abort_if(!$selectedCourseId, 400, 'Please select a course to export.');

        $course = Course::find($selectedCourseId);
        $fileName = 'report_on_' . Str::slug($course->name ?? 'course');

        if ($selectedUserId) {
            $student = User::find($selectedUserId);
            if ($student) {
                $fileName .= '_for_' . Str::slug($student->name);
            }
        }
        
        $fileName .= '_' . now()->format('Y-m-d') . '.xlsx';
        
        return Excel::download(new StudentReportExport($selectedCourseId, $selectedModuleId, $selectedUserId), $fileName);
    }
}
