<?php

namespace App\Services;

use App\Repositories\PickupRepository;
use App\Models\PickupRequest;

class PickupService
{
    protected $pickupRepository;

    public function __construct(PickupRepository $pickupRepository)
    {
        $this->pickupRepository = $pickupRepository;
    }

    /**
     * Create a pickup request logic
     */
    public function createRequest(int $customerId, array $data): PickupRequest
    {
        $data['customer_id'] = $customerId;
        $data['status'] = 'menunggu';
        return $this->pickupRepository->create($data);
    }

    /**
     * Retrieve requests for a customer
     */
    public function getCustomerPickups(int $customerId)
    {
        return $this->pickupRepository->getForCustomer($customerId);
    }

    /**
     * Retrieve tasks for an officer
     */
    public function getOfficerPickups(int $officerId)
    {
        return $this->pickupRepository->getForOfficer($officerId);
    }

    /**
     * Find request details
     */
    public function findRequest(int $id): ?PickupRequest
    {
        return $this->pickupRepository->findById($id);
    }
}
