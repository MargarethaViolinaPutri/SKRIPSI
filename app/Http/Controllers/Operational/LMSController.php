<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Master\CourseContract;
use App\Contract\Master\ModuleContract;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LMSController extends Controller
{

    protected CourseContract $service;

    public function __construct(CourseContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('operational/lms/index');
    }

    public function fetch()
    {
        $user = User::find(Auth::id());
        $classroom = $user->classRooms()->latest()->first();

        $data = $this->service->all(
            filters: ['name'],
            sorts: ['name'],
            paginate: true,
            conditions: [
                ['class_room_id', '=', $classroom->id],
            ],
            perPage: request()->get('per_page', 10),
        );

        return response()->json($data);
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('operational/lms/detail', [
            "course" => $data
        ]);
    }

}
