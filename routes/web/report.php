<?php

use App\Http\Controllers\Report\ReportController as ReportReportController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => 'reports',
    'as' => 'reports.',
    'middleware' => ['auth'],
], function () {
    Route::get('test', [ReportReportController::class, 'testReport'])->name('test');
    Route::get('test/export', [ReportReportController::class, 'exportTestReport'])->name('test.export');
    
    Route::get('module', [ReportReportController::class, 'moduleReport'])->name('module');
    Route::get('module/export', [ReportReportController::class, 'exportModuleReport'])->name('module.export');

    Route::get('student', [ReportReportController::class, 'studentReport'])->name('student');
    Route::get('student/export', [ReportReportController::class, 'exportStudentReport'])->name('student.export');
});