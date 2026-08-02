<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Role;

class AuthService
{
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function register(array $data): User
    {
        $role = Role::where('slug', 'pelanggan')->first();
        
        $user = $this->userRepository->create([
            'role_id' => $role ? $role->id : null,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'status' => 'pending', // Waiting admin approval
        ]);

        $user->customer()->create([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? $data['no_hp'] ?? '',
            'address' => $data['address'] ?? $data['alamat'] ?? '',
            'province_id' => $data['province_id'] ?? null,
            'city_id' => $data['city_id'] ?? null,
            'district_id' => $data['district_id'] ?? null,
            'village_id' => $data['village_id'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'house_photo' => $data['house_photo'] ?? null,
            'customer_type' => $data['customer_type'] ?? 'rumah_tangga',
        ]);

        return $user;
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang dimasukkan salah.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda belum aktif. Silakan tunggu verifikasi oleh admin.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load('role'),
            'token' => $token,
        ];
    }
}
