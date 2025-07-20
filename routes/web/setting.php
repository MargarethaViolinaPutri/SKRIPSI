<?php

use App\Http\Controllers\Setting\SettingController;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'setting',
    'as' => 'setting.',
    'middleware' => ['auth'],
], function () {
    Route::group([
        'prefix' => 'system',
        'as' => 'system.',
    ], function () {
        Route::get('', [SettingController::class, 'index'])->name('index');
        Route::get('create', [SettingController::class, 'create'])->name('create');
        Route::get('fetch', [SettingController::class, 'fetch'])->name('fetch');
        Route::get('{id}', [SettingController::class, 'show'])->name('show');
        Route::post('', [SettingController::class, 'store'])->name('store');
        Route::put('{id}', [SettingController::class, 'update'])->name('update');
        Route::delete('{id}', [SettingController::class, 'destroy'])->name('destroy');
    });
});
