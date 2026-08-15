<?php

namespace App\Http\Controllers;

use App\Models\WorkRegion;
use App\Models\Officer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WorkRegionController extends Controller
{
    /**
     * Get all active work regions (Public / General)
     */
    public function publicIndex(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => WorkRegion::where('is_active', true)->latest()->get()
        ]);
    }

    /**
     * Get all work regions (Admin)
     */
    public function index(): JsonResponse
    {
        $regions = WorkRegion::latest()->get()->map(function ($region) {
            // Count officers assigned to this region (matching region name)
            $officersCount = Officer::where('region', $region->name)->count();
            $region->officers_count = $officersCount;
            return $region;
        });

        return response()->json([
            'success' => true,
            'data' => $regions
        ]);
    }

    /**
     * Store a new work region
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:work_regions,code',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $region = WorkRegion::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Wilayah kerja '{$region->name}' berhasil ditambahkan.",
            'data' => $region
        ], 201);
    }

    /**
     * Show specific work region
     */
    public function show(WorkRegion $workRegion): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $workRegion
        ]);
    }

    /**
     * Update an existing work region
     */
    public function update(Request $request, WorkRegion $workRegion): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:work_regions,code,' . $workRegion->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $workRegion->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : $workRegion->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Wilayah kerja '{$workRegion->name}' berhasil diperbarui.",
            'data' => $workRegion
        ]);
    }

    /**
     * Delete a work region
     */
    public function destroy(WorkRegion $workRegion): JsonResponse
    {
        $name = $workRegion->name;
        $workRegion->delete();

        return response()->json([
            'success' => true,
            'message' => "Wilayah kerja '{$name}' telah dihapus."
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggle(WorkRegion $workRegion): JsonResponse
    {
        $workRegion->update([
            'is_active' => !$workRegion->is_active
        ]);

        $statusStr = $workRegion->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Status wilayah kerja '{$workRegion->name}' berhasil {$statusStr}.",
            'data' => $workRegion
        ]);
    }
}
