<?php

use Illuminate\Support\Facades\Route;

use App\Service\PrismService;

Route::post('/generate-questions', [App\Http\Controllers\HomeController::class, 'generateQuestions'])->name('home.generateQuestions');

// Test route for OpenAI API key and PrismService
Route::get('/test-prism', function (PrismService $prismService) {
    $sampleCode = "def add(a, b):\n    return a + b";
    try {
        $questions = $prismService->handle($sampleCode);
        return response()->json([
            'success' => true,
            'questions' => $questions,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});

use Inertia\Inertia;

Route::redirect('/', '/auth/login');