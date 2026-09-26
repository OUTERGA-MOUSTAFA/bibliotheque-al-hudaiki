<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\AdminController;

// ===== HEALTH =====
Route::get('/health', fn() => response()->json(['status' => 'ok', 'time' => now()]));

// ===== PUBLIC =====
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book:slug}', [BookController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/sponsors', [SponsorController::class, 'index']);

// ===== AUTH (public, rate limited) =====
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ===== LECTEUR (auth) =====
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'changePassword']);

    // Favoris
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{book}', [FavoriteController::class, 'toggle']);

    // Emprunts
    Route::get('/my-loans', [LoanController::class, 'myLoans']);
    Route::post('/loans', [LoanController::class, 'store']);
});

// ===== ADMIN =====
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    // Books
    Route::apiResource('books', BookController::class)->except(['index', 'show']);
    Route::post('/books/{book}/archive', [BookController::class, 'archive']);

    // Loans
    Route::get('/loans', [LoanController::class, 'index']);
    Route::post('/loans/{loan}/return', [LoanController::class, 'returnBook']);
    Route::delete('/loans/{loan}', [LoanController::class, 'destroy']);

    // Users
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{user}/archive', [AdminController::class, 'archiveUser']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
});