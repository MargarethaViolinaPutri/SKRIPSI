<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\CourseContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\CourseRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

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

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.course.index');
    }
}
