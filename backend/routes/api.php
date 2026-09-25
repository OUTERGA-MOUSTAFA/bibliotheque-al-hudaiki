<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{AuthController, BookController, LoanController,
    UserController, CategoryController, SponsorController, ContactController, DashboardController};

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/contact',  [ContactController::class, 'store']);
Route::get('/books',           [BookController::class, 'index']);
Route::get('/books/{book}',    [BookController::class, 'show']);
Route::get('/categories',      [CategoryController::class, 'index']);
Route::get('/sponsors',        [SponsorController::class, 'index']);

// Authentifié (lecteur)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/loans',  [LoanController::class, 'store'])->middleware('role:lecteur|admin');
    Route::get('/my-loans', fn() => auth()->user()->loans()->with('book')->get());
});

// Admin
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::apiResource('books', BookController::class)->except(['index','show']);
    Route::post('/books/{book}/archive', [BookController::class, 'archive']);
    Route::get('/loans',          [LoanController::class, 'index']);
    Route::post('/loans/{loan}/return', [LoanController::class, 'return']);
    Route::delete('/loans/{loan}',      [LoanController::class, 'destroy']);
    Route::apiResource('users', UserController::class);
});