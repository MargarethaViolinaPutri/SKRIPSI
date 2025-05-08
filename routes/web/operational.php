<?php

use App\Http\Controllers\Operational\LMSController;
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
});
