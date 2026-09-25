<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SponsorController;

/*
|--------------------------------------------------------------------------
| API Routes - Bibliothèque Al Hudaiki
|--------------------------------------------------------------------------
*/

// ===== HEALTH CHECK (cron-job.org keep-alive) =====
Route::get('/health', fn() => response()->json([
    'status' => 'ok',
    'time' => now()->toIso8601String(),
]));

// ===== PUBLIC =====
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book:slug}', [BookController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/sponsors', [SponsorController::class, 'index']);

// ===== AUTH (public) =====
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ===== AUTHENTIFIÉ (Sanctum) =====
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});