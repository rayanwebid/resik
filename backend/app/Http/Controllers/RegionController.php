<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\City;
use App\Models\District;
use App\Models\Village;
use Illuminate\Http\JsonResponse;

class RegionController extends Controller
{
    /**
     * Get all provinces
     */
    public function provinces(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Province::all()
        ]);
    }

    /**
     * Get all cities of a province
     */
    public function cities(Province $province): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $province->cities
        ]);
    }

    /**
     * Get all districts of a city
     */
    public function districts(City $city): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $city->districts
        ]);
    }

    /**
     * Get all villages of a district
     */
    public function villages(District $district): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $district->villages
        ]);
    }
}
