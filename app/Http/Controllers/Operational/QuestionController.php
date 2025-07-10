<?php

namespace App\Http\Controllers\Operational;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Contract\Operational\QuestionContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Http\Requests\StoreFibRequest;
use App\Models\Question;
use App\Service\Operational\ModuleService;
use App\Utils\WebResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;

class QuestionController extends Controller
{
    protected QuestionContract $service;
    protected ModuleService $moduleService;
    use AuthorizesRequests;

    public function __construct(QuestionContract $service, ModuleService $moduleService)
    {
        $this->service = $service;
        $this->moduleService = $moduleService;
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
        $result = $this->service->all(
            filters: [
                AllowedFilter::partial('name'),
                AllowedFilter::exact('module_id'),
            ],
            sorts: [
                'name',
                'created_at',
            ],
            paginate: true,
            relation: ['userAnswers'],
            withCount: ['userAnswers'],
            perPage: request()->get('per_page', 10)
        );

        if (isset($result['error'])) {
            return response()->json($result, 500);
        }

        $questions = collect($result['items']);

        $transformedQuestions = $questions->map(function ($question) {
            $latestAnswer = $question->userAnswers->sortByDesc('id')->first();
            return [
                'id' => $question->id,
                'name' => $question->name,
                'desc' => $question->desc,
                'user_answers_count' => $question->user_answers_count,
                
                'user_answer' => $latestAnswer ? [
                    'total_score' => (float) $latestAnswer->total_score,
                    'time_spent_in_seconds' => $latestAnswer->time_spent_in_seconds,
                ] : null,
            ];
        });

        $result['items'] = $transformedQuestions;

        return response()->json($result);
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('operational/question/form', [
            "question" => $data
        ]);
    }

    public function solve($id)
    {
        $question = Question::findOrFail($id);
        $module = $question->module;

        if ($this->moduleService->isLocked($module)) {
            return Inertia::render('error/moduleLocked', [
                'module' => $module
            ]);
        }

        $questionDataForStudent = [
            'id' => $question->id,
            'module_id' => $question->module_id,
            'name' => $question->name,
            'desc' => $question->desc,
            'code' => $question->code,
        ];

        return Inertia::render('operational/question/solve', [
            'question' => $questionDataForStudent
        ]);
    }
}