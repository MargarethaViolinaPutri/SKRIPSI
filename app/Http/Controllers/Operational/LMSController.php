<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Master\CourseContract;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        $course = Course::findOrFail($id);

        return Inertia::render('operational/module/index', [
            'course' => $course,
        ]);
    }

    // public function show($id)
    // {
    //     $data = $this->service->find($id);
    //     Log::debug('LMSController show course data:', ['course' => $data]);

    //     $modules = \App\Models\Module::where('course_id', $id)->get();
    //     Log::debug('LMSController show modules data:', ['modules' => $modules]);

    //     foreach ($modules as $module) {
    //         $materials = [];
    //         if ($module && !empty($module->material_paths)) {
    //             foreach ($module->material_paths as $path) {
    //                 $url = \App\Utils\MaterialHelper::getMaterialUrl($path);
    //                 Log::debug('Material URL generated:', ['path' => $path, 'url' => $url]);
    //                 if ($url) {
    //                     $materials[] = [
    //                         'url' => $url,
    //                         'file_name' => basename($path),
    //                     ];
    //                 }
    //             }
    //             $module->material_urls = $materials;
    //         } else {
    //             $module->materials = [];
    //         }
    //     }

    //     return Inertia::render('operational/lms/detail', [
    //         "course" => $data,
    //         "modules" => $modules,
    //     ]);
    // }
}