<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\UserContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class UserController extends Controller
{

    protected UserContract $service;

    public function __construct(UserContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/user/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: ['name'],
            sorts: ['name'],
            paginate: true,
            relation: ['roles'],
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/user/form');
    }

    public function store(UserRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'master.user.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/user/form', [
            "user" => $data
        ]);
    }

    public function update(UserRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'master.user.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.user.index');
    }
}
