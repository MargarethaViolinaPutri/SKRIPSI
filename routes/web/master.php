<?php

use App\Http\Controllers\Master\ClassRoomController;
use App\Http\Controllers\Master\CourseController;
use App\Http\Controllers\Master\ModuleController;
use App\Http\Controllers\Master\QuestionController;
use App\Http\Controllers\Master\TestController;
use App\Http\Controllers\Master\TestQuestionController;
use App\Http\Controllers\Master\UserController;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'master',
    'as' => 'master.',
    'middleware' => ['auth'],
], function () {

Route::group([
        'prefix' => 'classroom',
        'as' => 'classroom.',
    ], function () {
        Route::get('', [ClassRoomController::class, 'index'])->name('index');
        Route::get('create', [ClassRoomController::class, 'create'])->name('create');
        Route::get('fetch', [ClassRoomController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [ClassRoomController::class, 'show'])->name('show');
        Route::post('', [ClassRoomController::class, 'store'])->name('store');
        Route::put('{id}', [ClassRoomController::class, 'update'])->name('update');
        Route::delete('{id}', [ClassRoomController::class, 'destroy'])->name('destroy');

        Route::get('{id}/members', [ClassRoomController::class, 'members'])->name('members.fetch');
        Route::delete('member/{id}', [ClassRoomController::class, 'destroyMember'])->name('member.destroy');
    });

    Route::group([
        'prefix' => 'course',
        'as' => 'course.',
    ], function () {
        Route::get('', [CourseController::class, 'index'])->name('index');
        Route::get('create', [CourseController::class, 'create'])->name('create');
        Route::get('fetch', [CourseController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [CourseController::class, 'show'])->name('show');
        Route::post('', [CourseController::class, 'store'])->name('store');
        Route::put('{id}', [CourseController::class, 'update'])->name('update');
        Route::get('{id}/threshold', [CourseController::class, 'threshold'])->name('threshold');
        Route::get('{course}/threshold/export', [CourseController::class, 'exportThresholdData'])->name('threshold.export');
        Route::match(['put', 'post'], '{id}/threshold', [CourseController::class, 'updateThreshold'])->name('update.threshold');
        Route::delete('{id}', [CourseController::class, 'destroy'])->name('destroy');
    });

    Route::group([
        'prefix' => 'module',
        'as' => 'module.',
    ], function () {
        Route::get('', [ModuleController::class, 'index'])->name('index');
        Route::get('create', [ModuleController::class, 'create'])->name('create');
        Route::get('fetch', [ModuleController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [ModuleController::class, 'show'])->name('show');
        Route::post('', [ModuleController::class, 'store'])->name('store');
        Route::put('{id}', [ModuleController::class, 'update'])->name('update');
        Route::delete('{id}', [ModuleController::class, 'destroy'])->name('destroy');

        Route::get('{module}/gform-import', [ModuleController::class, 'showGformImport'])->name('gform.show');
        Route::post('{module}/import-gform', [ModuleController::class, 'importGform'])->name('import.gform');
    });

    Route::group([
        'prefix' => 'question',
        'as' => 'question.',
    ], function () {
        Route::get('', [QuestionController::class, 'index'])->name('index');
        Route::get('create', [QuestionController::class, 'create'])->name('create');
        Route::get('fetch', [QuestionController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [QuestionController::class, 'show'])->name('show');
        Route::post('', [QuestionController::class, 'store'])->name('store');

        // ✅ Add this line below:
        Route::post('store-fib', [QuestionController::class, 'storeFIB'])->name('store.fib');

        Route::put('{id}', [QuestionController::class, 'update'])->name('update');
        Route::delete('{id}', [QuestionController::class, 'destroy'])->name('destroy');
    });


    Route::group([
        'prefix' => 'user',
        'as' => 'user.',
    ], function () {
        Route::get('', [UserController::class, 'index'])->name('index');
        Route::get('create', [UserController::class, 'create'])->name('create');
        Route::get('fetch', [UserController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [UserController::class, 'show'])->name('show');
        Route::post('', [UserController::class, 'store'])->name('store');
        Route::put('{id}', [UserController::class, 'update'])->name('update');
        Route::delete('{id}', [UserController::class, 'destroy'])->name('destroy');
    });

    Route::group([
        'prefix' => 'test',
        'as' => 'test.',
    ], function () {
        Route::get('fetch', [TestController::class, 'fetch'])->name('fetch');

        Route::post('{test}/questions/store-batch', [TestQuestionController::class, 'storeBatch'])->name('questions.storeBatch');

        Route::post('{test}/questions', [TestQuestionController::class, 'store'])->name('questions.store');
        Route::delete('{test}/questions/{question}', [TestQuestionController::class, 'destroy'])->name('questions.destroy');
        Route::resource('', TestController::class) ->parameters(['' => 'test']);;
    });
});
