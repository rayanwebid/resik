<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePickupRequest;
use App\Services\PickupService;
use App\Services\PaymentService;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    protected $pickupService;
    protected $paymentService;

    public function __construct(PickupService $pickupService, PaymentService $paymentService)
    {
        $this->pickupService = $pickupService;
        $this->paymentService = $paymentService;
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
     * Get customer payments history and active payment methods
     */
    public function payments(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Profil pelanggan tidak ditemukan.'], 404);
        }

        $payments = $this->paymentService->getCustomerPayments($customer->id);
        $paymentMethods = $this->paymentService->getActivePaymentMethods();

        return response()->json([
            'success' => true,
            'data' => $payments,
            'payment_methods' => $paymentMethods,
        ]);
    }

    /**
     * Submit payment proof upload
     */
    public function pay(Request $request, Payment $payment): JsonResponse
    {
        $customer = $request->user()->customer;
        if (!$customer || $payment->customer_id !== $customer->id) {
            return response()->json(['success' => false, 'message' => 'Pembayaran tidak ditemukan.'], 404);
        }

        $paymentMethodNames = $this->paymentService->getActivePaymentMethods()->pluck('type')->toArray();

        $request->validate([
            'payment_method' => 'required|string|in:' . implode(',', $paymentMethodNames),
            'proof' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'proof_path' => 'nullable|string|max:3000000',
        ]);

        $proofPath = $request->payment_method === 'cash' ? null : $request->proof_path;

        if ($request->payment_method !== 'cash' && $request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('payments', 'public');
        }

        if ($request->payment_method !== 'cash' && $proofPath
            && !Str::startsWith($proofPath, 'data:image/')
            && !filter_var($proofPath, FILTER_VALIDATE_URL)
            && !Storage::disk('public')->exists($proofPath)) {
            return response()->json([
                'success' => false,
                'message' => 'Bukti pembayaran belum terkirim sebagai file. Silakan muat ulang halaman lalu pilih foto kembali.',
            ], 422);
        }

        // The web client sends the selected image as a data URL. Persist it on
        // the public disk instead of storing only the local filename.
        if ($proofPath && Str::startsWith($proofPath, 'data:image/')) {
            if (!preg_match('/^data:image\/(jpeg|png|jpg|gif|webp);base64,(.+)$/s', $proofPath, $matches)) {
                return response()->json(['success' => false, 'message' => 'Format bukti pembayaran tidak valid.'], 422);
            }

            $decoded = base64_decode($matches[2], true);
            if ($decoded === false || strlen($decoded) > 2 * 1024 * 1024) {
                return response()->json(['success' => false, 'message' => 'Ukuran bukti pembayaran maksimal 2MB.'], 422);
            }

            $extension = $matches[1] === 'jpg' ? 'jpeg' : $matches[1];
            $proofPath = Storage::disk('public')->put(
                'payments/' . Str::uuid() . '.' . $extension,
                $decoded
            );
            if (!$proofPath) {
                return response()->json(['success' => false, 'message' => 'Bukti pembayaran gagal disimpan.'], 500);
            }
        }

        $payment->update([
            'payment_method' => $request->payment_method,
            'proof_path' => $proofPath,
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
