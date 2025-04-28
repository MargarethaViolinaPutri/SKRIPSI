<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\ModuleContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\ModuleRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class ModuleController extends Controller
{
    protected ModuleContract $service;

    public function __construct(ModuleContract $service)
    {
        $this->service = $service;
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
        unset($payload['file']);

        $data = $this->service->create($payload);
        return WebResponse::response($data, 'master.module.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/module/form', [
            "module" => $data
        ]);
    }

    public function update(ModuleRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'master.module.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.module.index');
    }
}
