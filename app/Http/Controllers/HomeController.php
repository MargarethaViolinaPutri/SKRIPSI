<?php

namespace App\Http\Controllers;

use App\Service\PrismService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class HomeController extends Controller
{
    protected $prismService;

    public function __construct(PrismService $prismService)
    {
        $this->prismService = $prismService;
    }

    /**
     * Endpoint untuk generate soal fill-in-the-blank.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateQuestions(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'type' => 'nullable|in:single,multiple'
        ]);

        $code = $request->input('code');
        $type = $request->input('type'); // might be null

        try {
            $decoded = $this->prismService->generateQuestions($code, $type);
            return response()->json($decoded);
        } catch (Exception $e) {
            Log::error('Prism generateQuestions error: ' . $e->getMessage());

            if (
                str_contains(strtolower($e->getMessage()), 'rate limit') ||
                str_contains(strtolower($e->getMessage()), 'quota') ||
                str_contains(strtolower($e->getMessage()), 'insufficient_quota')
            ) {
                return response()->json(['error' => 'API quota exceeded, please try again later.'], 429);
            }

            return response()->json(['error' => 'Failed to generate questions with Prism.'], 500);
        }
    }
}