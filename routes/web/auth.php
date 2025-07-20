<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('login', [AuthController::class, 'login'])->name('login');

Route::group([
    'prefix' => 'auth',
    'as' => 'auth.',
], function () {
    Route::get('login', [AuthController::class, 'login'])->name('login');
    Route::post('login', [AuthController::class, 'attempt'])->name('attempt');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});
