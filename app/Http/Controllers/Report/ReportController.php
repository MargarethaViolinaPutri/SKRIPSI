<?php

namespace App\Http\Controllers\Report;

use App\Exports\ModuleReportExport;
use App\Exports\StudentReportExport;
use App\Exports\TestReportExport;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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
        
        $filters = $request->only(['course_id', 'question_id', 'name']);
        
        $selectedCourseId = ($filters['course_id'] ?? null) && $filters['course_id'] !== 'all' ? (int)$filters['course_id'] : null;
        $selectedQuestionId = ($filters['question_id'] ?? null) && $filters['question_id'] !== 'all' ? (int)$filters['question_id'] : null;
        $searchTerm = $filters['name'] ?? null;

        $questions = $selectedCourseId 
            ? Question::whereHas('module', fn($q) => $q->where('course_id', $selectedCourseId))->orderBy('name')->get(['id', 'name'])
            : collect();

        $reportData = $selectedCourseId
            ? (new StudentReportExport($selectedCourseId, $selectedQuestionId, $searchTerm))->collection()
            : collect();
        
        return Inertia::render('report/student', [
            'reportData' => $reportData,
            'courses' => $courses,
            'questions' => $questions,
            'filters' => $filters,
        ]);
    }

    public function exportStudentReport(Request $request)
    {
        $selectedCourseId = $request->input('course_id') && $request->input('course_id') !== 'all' ? (int)$request->input('course_id') : null;
        $selectedQuestionId = $request->input('question_id') && $request->input('question_id') !== 'all' ? (int)$request->input('question_id') : null;
        $searchTerm = $request->input('name');

        abort_if(!$selectedCourseId, 400, 'Please select a course to export.');

        $fileName = 'student_detail_report_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download(new StudentReportExport($selectedCourseId, $selectedQuestionId, $searchTerm), $fileName);
    }
}
