<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\CourseContract;
use App\Contract\Master\ModuleContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\ModuleRequest;
use App\Imports\GformAnswersImport;
use App\Models\Answer;
use App\Models\Module;
use App\Utils\WebResponse;
use App\Utils\MaterialHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ModuleController extends Controller
{
    protected ModuleContract $service;
    protected CourseContract $courseService;

    public function __construct(ModuleContract $service, CourseContract $courseService)
    {
        $this->service = $service;
        $this->courseService = $courseService;
    }

    public function index()
    {
        return Inertia::render('master/module/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: ['name'],
            sorts: ['name'],
            paginate: true,
            relation: ['course'],
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/module/form');
    }

    public function store(ModuleRequest $request)
    {
        $payload = $request->validated();
        $data = $this->service->create($payload);
        return WebResponse::response($data, 'master.module.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, relation: ['course']);

        if ($data instanceof \Exception) {
            abort(404, 'Module not found');
        }

        Log::debug('Module data in show:', ['data' => $data]);

        // Unwrap model instance if wrapped in array
        if (is_array($data) && isset($data['App\\Models\\Module'])) {
            $data = $data['App\\Models\\Module'];
        }

        // Use casted material_paths array directly
        $materialPaths = $data->material_paths ?? [];

        $materials = [];
        foreach ($materialPaths as $path) {
            $url = MaterialHelper::getMaterialUrl($path);
            if ($url) {
                $materials[] = [
                    'url' => $url,
                    'file_name' => basename($path),
                ];
            }
        }
        $data->materials = $materials;

        if (request()->wantsJson()) {
            return response()->json(['module' => $data]);
        }

        return Inertia::render('master/module/form', [
            "module" => $data
        ]);
    }

    public function update(ModuleRequest $request, $id)
    {
        Log::debug('Update request payload:', ['payload' => $request->all()]);

        $payload = $request->validated();

        // Remove 'materials' key as it is not a database column
        if (isset($payload['materials'])) {
            unset($payload['materials']);
        }

        Log::debug('Validated payload:', ['payload' => $payload]);

        $data = $this->service->update(
            [
                ['id', '=', $id],
            ],
            $payload
        );

        Log::debug('Update result:', ['data' => $data]);

        return WebResponse::response($data, 'master.module.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.module.index');
    }

    public function showGformImport(Module $module)
    {
        $gformAnswers = Answer::whereHas('question', function ($query) use ($module) {
            $query->where('module_id', $module->id);
        })
        ->where('source', 'gform')
        ->with('user:id,name')
        ->with('question:id,name')
        ->latest()
        ->get();

        return Inertia::render('master/module/GformImport', [
            'module' => $module,
            'gformAnswers' => $gformAnswers,
        ]);
    }

    public function importGform(Request $request, Module $module)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            Excel::import(new GformAnswersImport($module->id), $request->file('file'));
            return redirect()->back()->with('success', 'G-Form data imported successfully!');
        } catch (\Exception $e) {
            Log::error('GFORM IMPORT FAILED: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Import failed. Please check the file format and column headers. Error: ' . $e->getMessage());
        }
    }
}