<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\CourseContract;
use App\Exports\StudentClassificationExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\CourseRequest;
use App\Models\Course;
use App\Utils\WebResponse;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class CourseController extends Controller
{

    protected CourseContract $service;

    public function __construct(CourseContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/course/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: ['name'],
            sorts: ['name'],
            paginate: true,
            perPage: request()->get('per_page', 10),
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/course/form');
    }

    public function store(CourseRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'master.course.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/course/form', [
            "course" => $data
        ]);
    }

    public function update(CourseRequest $request, $id)
    {
        $payload = $request->validated();
        $data = $this->service->update(
            [
                ['id', '=', $id],
            ],
            $payload
        );
        return WebResponse::response($data, 'master.course.index');
    }

    public function threshold($id)
    {
        $data = $this->service->find($id);
        $averageData = $this->service->getAverageScoreAndStudentCount($id);
        $testProgress = $this->service->getTestProgress($id);
        $studentTestDetails = $this->service->getStudentTestDetails($id);
        return Inertia::render('master/course/threshold', [
            'course' => $data,
            'averageData' => $averageData,
            'testProgress' => $testProgress,
            'studentTestDetails' => $studentTestDetails,
        ]);
    }

    public function updateThreshold(\App\Http\Requests\ThresholdRequest $request, $id)
    {
        $payload = $request->validated();

        $updateSuccess = $this->service->update(
            [['id', '=', $id]],
            $payload
        );

        if ($updateSuccess) {
            $course = $this->service->find($id);
            $this->service->classifyStudentsByThreshold($course);
        }

        return WebResponse::response($updateSuccess, 'master.course.index');
    }

    public function exportThresholdData(Course $course)
    {
        $fileName = 'classification_report_' . Str::slug($course->name) . '_' . now()->format('Y-m-d') . '.xlsx';
        
        return Excel::download(new StudentClassificationExport($course->id), $fileName);
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.course.index');
    }
}