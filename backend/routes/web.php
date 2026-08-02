<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

// ─── Public welcome ────────────────────────────────────────────────────────────
Route::get('/', function () {
    return view('welcome');
});

// ─── Dashboard Auth ────────────────────────────────────────────────────────────
Route::prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/login',  [DashboardController::class, 'showLogin'])->name('login')->middleware('guest');
    Route::post('/login', [DashboardController::class, 'login'])->name('login.post');
    Route::post('/logout',[DashboardController::class, 'logout'])->name('logout');

    // Protected dashboard routes
    Route::middleware('auth')->group(function () {
        Route::get('/',          [DashboardController::class, 'home'])->name('home');

        // Customers
        Route::get('/customers',                   [DashboardController::class, 'customers'])->name('customers');
        Route::post('/customers/{user}/approve',   [DashboardController::class, 'approveCustomer'])->name('customers.approve');
        Route::post('/customers/{user}/reject',    [DashboardController::class, 'rejectCustomer'])->name('customers.reject');

        // Officers
        Route::get('/officers',         [DashboardController::class, 'officers'])->name('officers');
        Route::get('/officers/create',  [DashboardController::class, 'createOfficer'])->name('officers.create');
        Route::post('/officers',        [DashboardController::class, 'storeOfficer'])->name('officers.store');
        Route::post('/officers/{officer}/toggle', [DashboardController::class, 'toggleOfficer'])->name('officers.toggle');

        // Pickup Requests
        Route::get('/pickups',                              [DashboardController::class, 'pickups'])->name('pickups');
        Route::post('/pickups/{pickupRequest}/assign',      [DashboardController::class, 'assignPickup'])->name('pickups.assign');

        // Payments
        Route::get('/payments',                            [DashboardController::class, 'payments'])->name('payments');
        Route::post('/payments/{payment}/confirm',         [DashboardController::class, 'confirmPayment'])->name('payments.confirm');

        // Users
        Route::get('/users', [DashboardController::class, 'users'])->name('users');
    });
});

