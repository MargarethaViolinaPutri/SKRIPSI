<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\ClassRoomContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\ClassRoomRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class ClassRoomController extends Controller
{

    protected ClassRoomContract $service;

    public function __construct(ClassRoomContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/classroom/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: ['name', 'id', 'type', 'bi_code'],
            sorts: ['name', 'id', 'type', 'bi_code'],
            paginate: true,
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/classroom/form');
    }

    public function store(ClassRoomRequest $request)
    {
        $payload = $request->validated();
        unset($payload['members']);
        $data = $this->service->create($payload);
        return WebResponse::response($data, 'master.classroom.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/classroom/form', [
            "classroom" => $data
        ]);
    }

    public function update(ClassRoomRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'master.classroom.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.classroom.index');
    }
}
