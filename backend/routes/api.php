<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\ExcelUploadController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Search route (can be public or protected - configurable)
Route::post('/materials/search', [MaterialController::class, 'search']);

// Protected routes (admin or assistant)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Statistics (available for all authenticated users)
    Route::get('/materials/statistics', [MaterialController::class, 'getStatistics']);

    // Filters (available for all authenticated users)
    Route::get('/materials/filters/list', [MaterialController::class, 'getFilters']);

    // Export routes (available for all authenticated users)
    Route::get('/materials/export', [MaterialController::class, 'exportToExcel']);
    Route::get('/materials/export-statistics', [MaterialController::class, 'exportStatistics']);

    // Assistant routes (mark received/cancel received)
    Route::middleware(['assistant'])->group(function () {
        Route::post('/materials/{id}/received', [MaterialController::class, 'markReceived']);
        Route::post('/materials/{id}/cancel-received', [MaterialController::class, 'cancelReceived']);
    });

    // Admin only routes
    Route::middleware(['admin'])->group(function () {
        // Material CRUD routes
        Route::apiResource('materials', MaterialController::class);
        Route::post('/materials/delete-all', [MaterialController::class, 'deleteAll']);
        Route::post('/materials/bulk-update', [MaterialController::class, 'bulkUpdate']);

        // Excel upload route
        Route::post('/excel/upload', [ExcelUploadController::class, 'upload']);

        // User management routes
        Route::apiResource('users', UserController::class);
    });
});

