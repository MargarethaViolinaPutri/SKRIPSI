<?php

/**
 * @method \Illuminate\Routing\Controller middleware(string|array $middleware, array $options = [])
 */
namespace App\Http\Controllers\Master;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Contract\Master\QuestionContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Http\Requests\StoreFibRequest ;
use App\Utils\WebResponse;
use Inertia\Inertia;
use Illuminate\Routing\Controller as BaseController;

class QuestionController extends Controller
{
    protected QuestionContract $service;
    use AuthorizesRequests;

    public function __construct(QuestionContract $service)
    {
        $this->service = $service;

        // Izinkan semua method hanya untuk user login
        $this->middleware('auth');

        // ✅ Khusus storeFIB, lewati policy jika ada
        $this->middleware(function ($request, $next) {
            if ($request->route()->getActionMethod() === 'storeFIB') {
                return $next($request);
            }

            return $next($request);
        });
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

    public function storeFIB(StoreFibRequest $request)
    {
        $data = $this->service->createMultiple(
            $request->only(['module_id', 'name']),
            $request->input('questions', [])
        );

        return WebResponse::response($data, 'master.question.index');
    }

    // public function storeFIB(StoreFibRequest $request)
    // {
    //     foreach ($request->input('questions', []) as $q) {
    //         $result = $this->service->create([
    //             'module_id' => $request->module_id,
    //             'name' => $request->name . ' - Soal ' . $q['question_number'],
    //             'desc' => $q['narasi'],
    //             'code' => $q['kode_blank'],
    //             // Removed 'test' key to fix SQL error
    //             'test' => $q['kode_utuh'],
    //         ]);
    //         if ($result instanceof \Exception) {
    //             return response()->json([
    //                 'message' => 'Gagal menyimpan soal.',
    //                 'error' => $result->getMessage(),
    //             ], 500);
    //         }
    //     }

    //     return response()->json(['message' => 'Soal berhasil disimpan']);
    // }

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
