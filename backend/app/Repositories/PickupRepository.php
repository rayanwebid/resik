<?php

namespace App\Repositories;

use App\Models\PickupRequest;

class PickupRepository
{
    /**
     * Create a new pickup request record
     */
    public function create(array $data): PickupRequest
    {
        return PickupRequest::create($data);
    }

    /**
     * Get all pickup requests for a specific customer
     */
    public function getForCustomer(int $customerId)
    {
        return PickupRequest::where('customer_id', $customerId)
            ->with(['officer'])
            ->latest()
            ->get();
    }

    /**
     * Get tasks assigned to a specific officer
     */
    public function getForOfficer(int $officerId)
    {
        return PickupRequest::where('officer_id', $officerId)
            ->with(['customer', 'customer.village'])
            ->latest()
            ->get();
    }

    /**
     * Find a pickup request by ID
     */
    public function findById(int $id): ?PickupRequest
    {
        return PickupRequest::with(['customer', 'officer'])->find($id);
    }
}
