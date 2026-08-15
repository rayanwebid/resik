<?php

namespace App\Http\Controllers;

use App\Services\PickupService;
use App\Models\PickupHistory;
use App\Models\PickupRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OfficerController extends Controller
{
    protected $pickupService;

    public function __construct(PickupService $pickupService)
    {
        $this->pickupService = $pickupService;
    }

    /**
     * Get Officer tasks dashboard counters
     */
    public function dashboard(Request $request): JsonResponse
    {
        $officer = $request->user()->officer;
        if (!$officer) {
            return response()->json(['success' => false, 'message' => 'Profil petugas tidak ditemukan.'], 404);
        }

        $tasks = $this->pickupService->getOfficerPickups($officer->id);
        $total = $tasks->count();
        $completed = $tasks->where('status', 'selesai')->count();
        $active = $tasks->whereIn('status', ['diproses', 'dalam perjalanan'])->count();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_tasks' => $total,
                    'completed_tasks' => $completed,
                    'active_tasks' => $active,
                ],
                'next_task' => $tasks->where('status', 'menunggu')->first(),
                'officer' => $officer,
            ]
        ]);
    }

    /**
     * Get list of officer assigned tasks
     */
    public function tasks(Request $request): JsonResponse
    {
        $officer = $request->user()->officer;
        if (!$officer) {
            return response()->json(['success' => false, 'message' => 'Profil petugas tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->pickupService->getOfficerPickups($officer->id)
        ]);
    }

    /**
     * Update transit status of pickup request
     */
    public function updateStatus(Request $request, PickupRequest $pickupRequest): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:menunggu,diproses,dalam perjalanan,sudah diambil,batal',
        ]);

        $pickupRequest->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pengambilan berhasil diperbarui.',
            'data' => $pickupRequest
        ]);
    }

    /**
     * Complete task, record actual weight/fee and invoice
     */
    public function completeTask(Request $request, PickupRequest $pickupRequest): JsonResponse
    {
        $request->validate([
            'weight' => 'required|numeric|min:0.1',
            'cost' => 'required|numeric|min:0',
            'photo_before' => 'nullable|string',
            'photo_after' => 'nullable|string',
        ]);

        $officer = $request->user()->officer;
        if (!$officer) {
            return response()->json(['success' => false, 'message' => 'Profil petugas tidak ditemukan.'], 404);
        }

        $history = PickupHistory::create([
            'pickup_request_id' => $pickupRequest->id,
            'date' => now(),
            'officer_id' => $officer->id,
            'weight' => $request->weight,
            'cost' => $request->cost,
            'status' => 'selesai',
            'photo_before' => $request->photo_before,
            'photo_after' => $request->photo_after,
            'invoice_no' => 'INV-' . time() . '-' . $pickupRequest->id,
        ]);

        $pickupRequest->update([
            'status' => 'selesai',
            'officer_id' => $officer->id // Safeguard
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tugas penjemputan berhasil diselesaikan.',
            'data' => $history
        ]);
    }

    /**
     * Update GPS location values of the officer
     */
    public function updateGPS(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        \Log::info("Officer Live Location Update - User ID: {$request->user()->id}, Coords: [{$request->latitude}, {$request->longitude}]");

        if ($request->user()->officer) {
            $request->user()->officer->update([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Koordit GPS berhasil diperbarui.',
            'data' => [
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]
        ]);
    }
}
