<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Customer;
use App\Models\Officer;
use App\Models\PickupRequest;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Get admin consolidated dashboard data
     */
    public function dashboard(): JsonResponse
    {
        // Chart: monthly revenue last 6 months
        $monthly_revenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthly_revenue[] = [
                'month'   => $date->format('M Y'),
                'revenue' => Payment::where('status', 'Paid')
                    ->whereYear('payment_date', $date->year)
                    ->whereMonth('payment_date', $date->month)
                    ->sum('amount'),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_customers' => Customer::count(),
                    'total_officers' => Officer::count(),
                    'pending_approvals' => User::where('status', 'pending')->count(),
                    'unpaid_bills' => Payment::where('status', 'Unpaid')->count(),
                    'total_revenue' => Payment::where('status', 'Paid')->sum('amount'),
                ],
                'pending_customers' => User::where('status', 'pending')->with('customer')->get(),
                'active_requests' => PickupRequest::whereIn('status', ['menunggu', 'diproses', 'dalam perjalanan'])->with(['customer', 'officer'])->get(),
                'monthly_revenue' => $monthly_revenue,
            ]
        ]);
    }

    /**
     * Get all customers list
     */
    public function customers(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Customer::with('user')->get()
        ]);
    }

    /**
     * Approve customer signup status
     */
    public function approveCustomer(Request $request, User $user): JsonResponse
    {
        $user->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => "Registrasi pelanggan '{$user->name}' telah berhasil disetujui."
        ]);
    }

    /**
     * Reject customer signup status
     */
    public function rejectCustomer(Request $request, User $user): JsonResponse
    {
        $user->update(['status' => 'rejected']);

        return response()->json([
            'success' => true,
            'message' => "Registrasi pelanggan '{$user->name}' telah ditolak."
        ]);
    }

    /**
     * Get all officers list
     */
    public function officers(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Officer::with('user')->get()
        ]);
    }

    /**
     * Create/Register an officer account
     */
    public function storeOfficer(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'nik' => 'required|string|unique:officers,nik',
            'phone' => 'required|string',
            'address' => 'required|string',
            'region' => 'nullable|string',
        ]);

        $role = \App\Models\Role::where('slug', 'petugas')->first();

        $user = User::create([
            'role_id' => $role ? $role->id : null,
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Hash::make($request->password),
            'status' => 'active',
        ]);

        $officer = Officer::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'nik' => $request->nik,
            'phone' => $request->phone,
            'address' => $request->address,
            'region' => $request->region,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Petugas sampah berhasil didaftarkan.',
            'data' => $officer
        ], 201);
    }

    /**
     * Toggle officer active status
     */
    public function toggleOfficer(Request $request, Officer $officer): JsonResponse
    {
        $officer->update(['is_active' => !$officer->is_active]);
        $status = $officer->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Petugas sampah berhasil {$status}.",
            'data' => $officer
        ]);
    }

    /**
     * Assign a pickup request task to an officer
     */
    public function assignPickup(Request $request, PickupRequest $pickupRequest): JsonResponse
    {
        $request->validate([
            'officer_id' => 'required|exists:officers,id',
        ]);

        $pickupRequest->update([
            'officer_id' => $request->officer_id,
            'status' => 'diproses'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Petugas penjemputan berhasil ditugaskan.',
            'data' => $pickupRequest->load('officer')
        ]);
    }

    /**
     * Create a new pickup request on behalf of a customer (admin only)
     */
    public function createPickup(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id'      => 'required|exists:customers,id',
            'date'             => 'required|date',
            'time'             => 'required|string',
            'waste_type'       => 'required|in:organik,anorganik,campuran,b3',
            'estimated_weight' => 'required|numeric|min:0.1',
            'notes'            => 'nullable|string|max:500',
            'officer_id'       => 'nullable|exists:officers,id',
        ]);

        $pickup = PickupRequest::create([
            'customer_id'      => $request->customer_id,
            'date'             => $request->date,
            'time'             => $request->time,
            'waste_type'       => $request->waste_type,
            'estimated_weight' => $request->estimated_weight,
            'notes'            => $request->notes,
            'photo'            => 'admin_created.png',
            'status'           => $request->officer_id ? 'diproses' : 'menunggu',
            'officer_id'       => $request->officer_id ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Penugasan pickup berhasil dibuat.',
            'data'    => $pickup->load(['customer', 'officer'])
        ], 201);
    }

    /**
     * View all payments history
     */
    public function payments(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Payment::with('customer')->latest()->get()
        ]);
    }

    /**
     * Confirm/Approve/Reject customer payments
     */
    public function confirmPayment(Request $request, Payment $payment): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
        ]);

        if ($request->action === 'approve') {
            $payment->update(['status' => 'Paid']);
            $msg = 'Pembayaran berhasil dikonfirmasi.';
        } else {
            $payment->update(['status' => 'Unpaid', 'proof_path' => null]);
            $msg = 'Bukti pembayaran ditolak.';
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'data' => $payment
        ]);
    }

    /**
     * Get all news articles
     */
    public function newsIndex(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => \App\Models\News::with('author')->latest()->get()
        ]);
    }

    /**
     * Get single news article
     */
    public function newsShow(\App\Models\News $news): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $news
        ]);
    }

    /**
     * Store new news article
     */
    public function newsStore(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = '/storage/' . $request->file('image')->store('news', 'public');
        }

        $news = \App\Models\News::create([
            'title' => $request->title,
            'slug' => \Illuminate\Support\Str::slug($request->title) . '-' . time(),
            'summary' => $request->summary,
            'content' => $request->content,
            'image' => $imagePath,
            'author_id' => $request->user()->id,
            'views' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berita baru berhasil diterbitkan.',
            'data' => $news
        ], 201);
    }

    /**
     * Update news article
     */
    public function newsUpdate(Request $request, \App\Models\News $news): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $dataToUpdate = [
            'title' => $request->title,
            'slug' => \Illuminate\Support\Str::slug($request->title) . '-' . $news->id,
            'summary' => $request->summary,
            'content' => $request->content,
        ];

        if ($request->hasFile('image')) {
            $dataToUpdate['image'] = '/storage/' . $request->file('image')->store('news', 'public');
        }

        $news->update($dataToUpdate);

        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil diperbarui.',
            'data' => $news
        ]);
    }

    /**
     * Delete news article
     */
    public function newsDestroy(\App\Models\News $news): JsonResponse
    {
        $news->delete();
        return response()->json([
            'success' => true,
            'message' => 'Berita berhasil dihapus.'
        ]);
    }

    /**
     * Get company/frontend profile settings
     */
    public function getSettings(): JsonResponse
    {
        $company = \App\Models\Company::firstOrCreate(['id' => 1], [
            'name' => 'SI-SAMPAH',
            'history' => 'Layanan pengelolaan sampah mandiri.',
            'vision' => 'Lingkungan bersih dan sehat.',
            'mission' => 'Mengurangi sampah plastik nasional.',
            'address' => 'Jakarta, Indonesia',
            'phone' => '021-12345678',
            'email' => 'info@resikapp.com',
        ]);

        return response()->json([
            'success' => true,
            'data' => $company
        ]);
    }

    /**
     * Update company/frontend profile settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'history' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'favicon' => 'nullable|mimes:ico,png,jpeg,jpg,svg,gif|max:1024',
        ]);

        $company = \App\Models\Company::firstOrCreate(['id' => 1]);
        
        $dataToUpdate = $request->only([
            'name', 'history', 'vision', 'mission', 'address', 'phone', 'email',
        ]);

        if ($request->hasFile('logo')) {
            $dataToUpdate['logo'] = '/storage/' . $request->file('logo')->store('company', 'public');
        }
        
        if ($request->hasFile('favicon')) {
            $dataToUpdate['favicon'] = '/storage/' . $request->file('favicon')->store('company', 'public');
        }

        $company->update($dataToUpdate);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan website berhasil disimpan.',
            'data' => $company
        ]);
    }
}
