<?php

namespace App\Http\Controllers\Operational;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Contract\Operational\QuestionContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Http\Requests\StoreFibRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class QuestionController extends Controller
{
    protected QuestionContract $service;
    use AuthorizesRequests;

    public function __construct(QuestionContract $service)
    {
        $this->service = $service;

        // Allow all methods only for authenticated users
        $this->middleware('auth');

        // Skip policy for storeFIB method if any
        $this->middleware(function ($request, $next) {
            if ($request->route()->getActionMethod() === 'storeFIB') {
                return $next($request);
            }

            return $next($request);
        });
    }

    public function index()
    {
        return Inertia::render('operational/question/index');
    }

    public function fetch()
    {
        $paginator = $this->service->all(
            filters: ['name'],
            sorts: ['name'],
            paginate: true,
            relation: ['module'],
            perPage: request()->get('per_page', 10)
        );

        Log::info('Fetched questions:', ['data' => $paginator->toArray()]);

        $response = [
            'items' => $paginator->items(),
            'current_page' => $paginator->currentPage(),
            'total_page' => $paginator->lastPage(),
            'total' => $paginator->total(),
        ];

        return response()->json($response);
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('operational/question/form', [
            "question" => $data
        ]);
    }
}