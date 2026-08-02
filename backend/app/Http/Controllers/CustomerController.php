<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePickupRequest;
use App\Services\PickupService;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    protected $pickupService;

    public function __construct(PickupService $pickupService)
    {
        $this->pickupService = $pickupService;
    }

    /**
     * Get Customer dashboard counters and summaries
     */
    public function dashboard(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Profil pelanggan tidak ditemukan.'
            ], 404);
        }

        $pickups = $this->pickupService->getCustomerPickups($customer->id);
        $totalPickups = $pickups->count();
        $completedPickups = $pickups->where('status', 'selesai')->count();
        $pendingPickups = $pickups->where('status', 'menunggu')->count();

        $activeBill = Payment::where('customer_id', $customer->id)
            ->whereIn('status', ['Unpaid', 'Jatuh Tempo'])
            ->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_pickups' => $totalPickups,
                    'completed_pickups' => $completedPickups,
                    'pending_pickups' => $pendingPickups,
                    'active_bill' => $activeBill,
                ],
                'latest_pickup' => $pickups->first(),
                'latest_bill' => Payment::where('customer_id', $customer->id)->latest()->first()
            ]
        ]);
    }

    /**
     * Submit a new pickup request
     */
    public function requestPickup(StorePickupRequest $request): JsonResponse
    {
        $customer = $request->user()->customer;
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Profil pelanggan tidak ditemukan.'], 404);
        }

        $pickup = $this->pickupService->createRequest($customer->id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Permintaan pengambilan sampah berhasil diajukan.',
            'data' => $pickup
        ], 201);
    }

    /**
     * Get list of customer pickup requests
     */
    public function pickups(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Profil pelanggan tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->pickupService->getCustomerPickups($customer->id)
        ]);
    }

    /**
     * Get customer payments history
     */
    public function payments(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Profil pelanggan tidak ditemukan.'], 404);
        }

        $payments = Payment::where('customer_id', $customer->id)->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Submit payment proof upload
     */
    public function pay(Request $request, Payment $payment): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string',
            'proof_path' => 'required|string',
        ]);

        $payment->update([
            'payment_method' => $request->payment_method,
            'proof_path' => $request->proof_path,
            'status' => 'Pending',
            'payment_date' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.',
            'data' => $payment
        ]);
    }
}
