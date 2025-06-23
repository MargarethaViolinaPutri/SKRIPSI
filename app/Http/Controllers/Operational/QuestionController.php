<?php

namespace App\Http\Controllers\Operational;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Contract\Operational\QuestionContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Http\Requests\StoreFibRequest;
use App\Utils\WebResponse;
use Illuminate\Http\JsonResponse;
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

    public function fetch(): JsonResponse
    {
        $allowedFilters = [
            'name',
            'module_id'
        ];

        $allowedSorts = [
            'name',
            'created_at'
        ];
        
        $result = $this->service->all(
            filters: $allowedFilters,
            sorts: $allowedSorts,
            paginate: true,
            perPage: request()->get('per_page', 10)
        );

        return response()->json($result);
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('operational/question/form', [
            "question" => $data
        ]);
    }
}