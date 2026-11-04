<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ContactController;

Route::get('/health', fn() => response()->json(['status' => 'ok', 'time' => now()]));

// Public
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:auth');
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book:slug}', [BookController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/sponsors', [SponsorController::class, 'index']);

// 🛡️ Auth (protégé par rate limiter)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Authentifié
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{book}', [FavoriteController::class, 'toggle']);
    Route::get('/my-loans', [LoanController::class, 'myLoans']);
    Route::post('/loans', [LoanController::class, 'store']);
});

// Admin
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    // Livres (la liste admin inclut les archivés, contrairement à /books public)
    Route::get('/books', [BookController::class, 'adminIndex']);
    Route::apiResource('books', BookController::class)->except(['index', 'show']);
    Route::post('/books/{book}/archive', [BookController::class, 'archive']);
    Route::post('/books/{book}/restore', [BookController::class, 'restore']);

    // Catégories
    Route::apiResource('categories', CategoryController::class);
    Route::post('/categories/{category}/archive', [CategoryController::class, 'archive']);

    // Prêts
    Route::get('/loans', [LoanController::class, 'index']);
    Route::post('/loans/{loan}/return', [LoanController::class, 'returnBook']);
    Route::delete('/loans/{loan}', [LoanController::class, 'destroy']);

    // Utilisateurs
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{user}/archive', [AdminController::class, 'archiveUser']);
    Route::patch('/users/{user}/restore', [AdminController::class, 'restoreUser']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);

    // Sponsors
    Route::apiResource('sponsors', SponsorController::class)->except(['index', 'show']);

    // Messages de contact
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::patch('/contacts/{contactRequest}/read', [ContactController::class, 'markAsRead']);
});
