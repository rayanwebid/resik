<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentMethodController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Public list — hanya metode yang aktif, untuk pelanggan.
     */
    public function publicIndex(PaymentService $paymentService): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $paymentService->getActivePaymentMethods(),
        ]);
    }

    /**
     * Admin list — semua metode termasuk yang tidak aktif.
     */
    public function index(): JsonResponse
    {
        $methods = PaymentMethod::orderBy('order')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateRequest($request);
        $validated['order'] = PaymentMethod::max('order') + 1;

        $method = PaymentMethod::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Metode pembayaran berhasil ditambahkan.',
            'data' => $method,
        ], 201);
    }

    public function show(PaymentMethod $paymentMethod): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $paymentMethod,
        ]);
    }

    public function update(Request $request, PaymentMethod $paymentMethod): JsonResponse
    {
        $validated = $this->validateRequest($request);
        $paymentMethod->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Metode pembayaran berhasil diperbarui.',
            'data' => $paymentMethod,
        ]);
    }

    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        $paymentMethod->delete();

        return response()->json([
            'success' => true,
            'message' => 'Metode pembayaran berhasil dihapus.',
        ]);
    }

    public function toggle(PaymentMethod $paymentMethod): JsonResponse
    {
        $paymentMethod->update(['is_active' => !$paymentMethod->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status metode pembayaran berhasil diubah.',
            'data' => $paymentMethod,
        ]);
    }

    protected function validateRequest(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|string|in:bank_transfer,qris,cash,virtual_account',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'account_holder' => 'nullable|string|max:100',
            'image_path' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean',
        ]);
    }
}
