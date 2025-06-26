<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\TestContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Master\TestRequest;
use App\Models\Test;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestController extends Controller
{
    protected TestContract $service;

    public function __construct(TestContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/test/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: ['title', 'type', 'status'],
            sorts: ['title', 'type', 'status', 'created_at'],
            paginate: true,
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/test/form');
    }

    public function store(TestRequest $request)
    {
        $payload = $request->validated();
        $data = $this->service->create($payload);

        return WebResponse::response($data, 'master.test.index');
    }

    public function show(Test $test)
    {
        $test->load('questions.options');

        if (request()->wantsJson()) {
            return response()->json(['test' => $test]);
        }

        return Inertia::render('master/test/show', [
            "test" => $test
        ]);
    }

    public function update(TestRequest $request, $id)
    {
        $payload = $request->validated();
        $data = $this->service->update([['id', '=', $id]], $payload);
        return WebResponse::response($data, 'master.test.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.test.index');
    }
}
