<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\ClassRoomContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\ClassRoomRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\User;

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
        $data = $this->service->create($payload);
        return WebResponse::response($data, 'master.classroom.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, relation: ['members', 'teacher']);
        $teachers = User::whereHas('roles', function ($query) {
            $query->where('name', 'teacher');
        })->get(['id', 'name']);
        return Inertia::render('master/classroom/detail', [
            "classroom" => $data,
            "teachers" => $teachers,
        ]);
    }

    public function update(ClassRoomRequest $request, $id)
    {
        $payload = $request->validated();

        if (isset($payload['members']) && is_array($payload['members'])) {
            $payload['members'] = array_map(function ($member) {
                return ['user_id' => $member['value']];
            }, $payload['members']);
        }

        $data = $this->service->update(
            [
                ['id', '=', $id],
            ],
            $payload
        );

        if ($request->expectsJson()) {
            return WebResponse::json($data);
        }

        return WebResponse::response($data, 'master.classroom.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.classroom.index');
    }

    public function members($id)
    {
        $data = $this->service->find($id, relation: ['members']);
        Log::info('ClassRoom members data:', ['members' => $data->members]);
        return response()->json([
            'data' => $data->members,
        ]);
    }

    public function destroyMember($id)
    {
        // Assuming service has method to remove member by id
        $data = $this->service->removeMember($id);
        return response()->json([
            'message' => 'Member deleted successfully',
        ]);
    }
}
