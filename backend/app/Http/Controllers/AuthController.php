<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new customer user (status pending)
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil. Silakan tunggu verifikasi admin untuk mengaktifkan akun Anda.',
            'data' => $user->load('customer'),
        ], 201);
    }

    /**
     * Login user and issue api token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->email, $request->password);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => $result['user'],
                'token' => $result['token'],
            ]
        ]);
    }

    /**
     * Logout and revoke tokens
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null
        ]);
    }

    /**
     * Get current user profile Info (from token)
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Profil pengguna berhasil diambil.',
            'data' => $request->user()->load('role', 'customer', 'officer')
        ]);
    }
}
