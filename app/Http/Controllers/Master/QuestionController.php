<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\QuestionContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class QuestionController extends Controller
{
    protected QuestionContract $service;

    public function __construct(QuestionContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/question/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            filters: ['name'],
            sorts: ['name'],
            paginate: true,
            relation: ['module'],
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/question/form');
    }

    public function store(QuestionRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'master.question.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/question/form', [
            "question" => $data
        ]);
    }

    public function update(QuestionRequest $request, $id)
    {
        $payload = $request->validated();
        $data = $this->service->update(
            [
                ['id', '=', $id],
            ],
            $payload
        );
        return WebResponse::response($data, 'master.question.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'master.question.index');
    }
}
