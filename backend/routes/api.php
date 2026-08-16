<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\CMSController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OfficerController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\CheckRole;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Public Endpoints ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Regions Master Data
Route::get('/work-regions-public', [\App\Http\Controllers\WorkRegionController::class, 'publicIndex']);
Route::get('/provinces', [RegionController::class, 'provinces']);
Route::get('/provinces/{province}/cities', [RegionController::class, 'cities']);
Route::get('/cities/{city}/districts', [RegionController::class, 'districts']);
Route::get('/districts/{district}/villages', [RegionController::class, 'villages']);

// CMS & Website Data
Route::get('/home-data', [CMSController::class, 'getHomeData']);
Route::get('/news', [CMSController::class, 'newsIndex']);
Route::get('/news/{slug}', [CMSController::class, 'newsShow']);
Route::get('/activities', [CMSController::class, 'activitiesIndex']);
Route::get('/company-profile', [CMSController::class, 'profile']);

// Public: active payment methods (for customer billing instructions)
Route::get('/payment-methods', [PaymentMethodController::class, 'publicIndex']);


// --- Private / Authenticated Endpoints ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Customer Module (Pelanggan)
    Route::middleware(CheckRole::class . ':pelanggan')->prefix('customer')->group(function () {
        Route::get('/dashboard', [CustomerController::class, 'dashboard']);
        Route::post('/pickup-requests', [CustomerController::class, 'requestPickup']);
        Route::get('/pickup-requests', [CustomerController::class, 'pickups']);
        Route::get('/payments', [CustomerController::class, 'payments']);
        Route::post('/payments/{payment}/pay', [CustomerController::class, 'pay']);
        Route::get('/payments/{payment}/invoice', [\App\Http\Controllers\InvoiceController::class, 'show']);
    });

    // Officer Module (Petugas)
    Route::middleware(CheckRole::class . ':petugas')->prefix('officer')->group(function () {
        Route::get('/dashboard', [OfficerController::class, 'dashboard']);
        Route::get('/tasks', [OfficerController::class, 'tasks']);
        Route::patch('/tasks/{pickupRequest}/status', [OfficerController::class, 'updateStatus']);
        Route::post('/tasks/{pickupRequest}/complete', [OfficerController::class, 'completeTask']);
        Route::post('/gps', [OfficerController::class, 'updateGPS']);
    });

    // Super Admin Module (Admin)
    Route::middleware(CheckRole::class . ':super-admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/customers', [AdminController::class, 'customers']);
        Route::post('/customers/{user}/approve', [AdminController::class, 'approveCustomer']);
        Route::post('/customers/{user}/reject', [AdminController::class, 'rejectCustomer']);
        Route::put('/customers/{customer}/payment-due-day', [AdminController::class, 'updatePaymentDueDay']);
        Route::get('/officers', [AdminController::class, 'officers']);
        Route::post('/officers', [AdminController::class, 'storeOfficer']);
        Route::post('/officers/{officer}/toggle', [AdminController::class, 'toggleOfficer']);
        Route::post('/pickup-requests', [AdminController::class, 'createPickup']);
        Route::post('/pickup-requests/{pickupRequest}/assign', [AdminController::class, 'assignPickup']);
        Route::get('/payments', [AdminController::class, 'payments']);
        Route::post('/payments/{payment}/confirm', [AdminController::class, 'confirmPayment']);

        // News & Settings Management
        Route::get('/news', [AdminController::class, 'newsIndex']);
        Route::get('/news/{news}', [AdminController::class, 'newsShow']);
        Route::post('/news', [AdminController::class, 'newsStore']);
        Route::post('/news/{news}', [AdminController::class, 'newsUpdate']); // Changed to POST for multipart/form-data
        Route::delete('/news/{news}', [AdminController::class, 'newsDestroy']);
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::post('/settings', [AdminController::class, 'updateSettings']);

        // Payment Methods Management (Transfer Bank, QRIS, Cash, VA)
        Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
        Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
        Route::get('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'show']);
        Route::put('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']);
        Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
        Route::post('/payment-methods/{paymentMethod}/toggle', [PaymentMethodController::class, 'toggle']);

        // Invoice PDF for a payment
        Route::get('/payments/{payment}/invoice', [\App\Http\Controllers\InvoiceController::class, 'show']);

        // Work Regions Management (Wilayah Kerja)
        Route::get('/work-regions', [\App\Http\Controllers\WorkRegionController::class, 'index']);
        Route::post('/work-regions', [\App\Http\Controllers\WorkRegionController::class, 'store']);
        Route::get('/work-regions/{workRegion}', [\App\Http\Controllers\WorkRegionController::class, 'show']);
        Route::put('/work-regions/{workRegion}', [\App\Http\Controllers\WorkRegionController::class, 'update']);
        Route::delete('/work-regions/{workRegion}', [\App\Http\Controllers\WorkRegionController::class, 'destroy']);
        Route::post('/work-regions/{workRegion}/toggle', [\App\Http\Controllers\WorkRegionController::class, 'toggle']);
    });
});

