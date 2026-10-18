<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\AdminController;

Route::get('/health', fn() => response()->json(['status' => 'ok', 'time' => now()]));

// Public
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book:slug}', [BookController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/sponsors', [SponsorController::class, 'index']);

// 🛡️ Auth (Protected b Rate Limiter)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{book}', [FavoriteController::class, 'toggle']);
    Route::get('/my-loans', [LoanController::class, 'myLoans']);
});

// Admin
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::apiResource('books', BookController::class)->except(['index', 'show']);
    Route::get('/loans', [LoanController::class, 'index']);
    Route::get('/users', [AdminController::class, 'users']);
});