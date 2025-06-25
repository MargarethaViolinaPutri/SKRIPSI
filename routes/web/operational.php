<?php

use App\Http\Controllers\Operational\LMSController;
use App\Http\Controllers\Operational\ModuleController;
use App\Http\Controllers\Operational\QuestionController;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'operational',
    'as' => 'operational.',
    'middleware' => ['auth'],
], function () {

    Route::group([
        'prefix' => 'lms',
        'as' => 'lms.',
    ], function () {
        Route::get('', [LMSController::class, 'index'])->name('index');
        Route::get('fetch', [LMSController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [LMSController::class, 'show'])->name('show');
    });

    Route::group([
        'prefix' => 'question',
        'as' => 'question.',
    ], function () {
        Route::get('', [QuestionController::class, 'index'])->name('index');
        Route::get('fetch', [QuestionController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [QuestionController::class, 'show'])->name('show');
        Route::get('{id}/solve', [QuestionController::class, 'solve'])->name('solve');
    });
    
    Route::group([
        'prefix' => 'module',
        'as' => 'module.',
    ], function () {
        Route::get('', [ModuleController::class, 'index'])->name('index');
        Route::get('fetch', [ModuleController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [ModuleController::class, 'show'])->name('show');

        Route::get('{id}/material', [ModuleController::class, 'showMaterial'])->name('material');
    });
});
