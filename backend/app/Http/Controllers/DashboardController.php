<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Customer;
use App\Models\Officer;
use App\Models\PickupRequest;
use App\Models\Payment;
use App\Models\News;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller
{
    // ─── Auth ──────────────────────────────────────────────────────────────────

    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard.home');
        }
        return view('dashboard.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();
            if (!$user->hasRole('super-admin')) {
                Auth::logout();
                return back()->withErrors(['email' => 'Akun ini tidak memiliki akses dashboard admin.']);
            }
            $request->session()->regenerate();
            return redirect()->route('dashboard.home');
        }

        return back()->withErrors(['email' => 'Email atau password salah.'])->withInput();
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('dashboard.login');
    }

    // ─── Dashboard Home ────────────────────────────────────────────────────────

    public function home()
    {
        $stats = [
            'total_customers'   => Customer::count(),
            'total_officers'    => Officer::count(),
            'pending_approvals' => User::where('status', 'pending')->count(),
            'unpaid_bills'      => Payment::where('status', 'Unpaid')->count(),
            'total_revenue'     => Payment::where('status', 'Paid')->sum('amount'),
            'active_requests'   => PickupRequest::whereIn('status', ['menunggu', 'diproses', 'dalam perjalanan'])->count(),
        ];

        $pending_customers = User::where('status', 'pending')->with('customer')->latest()->take(5)->get();
        $recent_requests   = PickupRequest::with(['customer.user', 'officer.user'])
            ->latest()->take(8)->get();
        $recent_payments   = Payment::with('customer.user')->latest()->take(8)->get();

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

        return view('dashboard.home', compact('stats', 'pending_customers', 'recent_requests', 'recent_payments', 'monthly_revenue'));
    }

    // ─── Customers ─────────────────────────────────────────────────────────────

    public function customers(Request $request)
    {
        $query = Customer::with('user');
        if ($search = $request->search) {
            $query->whereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }
        if ($status = $request->status) {
            $query->whereHas('user', fn($q) => $q->where('status', $status));
        }
        $customers = $query->latest()->paginate(15)->withQueryString();
        return view('dashboard.customers', compact('customers'));
    }

    public function approveCustomer(User $user)
    {
        $user->update(['status' => 'active']);
        return back()->with('success', "Pelanggan '{$user->name}' berhasil disetujui.");
    }

    public function rejectCustomer(User $user)
    {
        $user->update(['status' => 'rejected']);
        return back()->with('error', "Pelanggan '{$user->name}' telah ditolak.");
    }

    // ─── Officers ──────────────────────────────────────────────────────────────

    public function officers(Request $request)
    {
        $query = Officer::with('user');
        if ($search = $request->search) {
            $query->where('name', 'like', "%{$search}%")->orWhere('region', 'like', "%{$search}%");
        }
        $officers = $query->latest()->paginate(15)->withQueryString();
        return view('dashboard.officers', compact('officers'));
    }

    public function createOfficer()
    {
        return view('dashboard.officers-create');
    }

    public function storeOfficer(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
            'nik'      => 'required|string|unique:officers,nik',
            'phone'    => 'required|string',
            'address'  => 'required|string',
            'region'   => 'nullable|string',
        ]);

        $role = \App\Models\Role::where('slug', 'petugas')->first();

        $user = User::create([
            'role_id'  => $role?->id,
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'status'   => 'active',
        ]);

        Officer::create([
            'user_id'   => $user->id,
            'name'      => $request->name,
            'nik'       => $request->nik,
            'phone'     => $request->phone,
            'address'   => $request->address,
            'region'    => $request->region,
            'is_active' => true,
        ]);

        return redirect()->route('dashboard.officers')->with('success', 'Petugas berhasil ditambahkan.');
    }

    public function toggleOfficer(Officer $officer)
    {
        $officer->update(['is_active' => !$officer->is_active]);
        $status = $officer->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Petugas berhasil {$status}.");
    }

    // ─── Pickup Requests ───────────────────────────────────────────────────────

    public function pickups(Request $request)
    {
        $query = PickupRequest::with(['customer.user', 'officer.user']);
        if ($status = $request->status) {
            $query->where('status', $status);
        }
        $pickups  = $query->latest()->paginate(15)->withQueryString();
        $officers = Officer::where('is_active', true)->with('user')->get();
        return view('dashboard.pickups', compact('pickups', 'officers'));
    }

    public function assignPickup(Request $request, PickupRequest $pickupRequest)
    {
        $request->validate(['officer_id' => 'required|exists:officers,id']);
        $pickupRequest->update(['officer_id' => $request->officer_id, 'status' => 'diproses']);
        return back()->with('success', 'Petugas berhasil ditugaskan.');
    }

    // ─── Payments ──────────────────────────────────────────────────────────────

    public function payments(Request $request)
    {
        $query = Payment::with('customer.user');
        if ($status = $request->status) {
            $query->where('status', $status);
        }
        $payments = $query->latest()->paginate(15)->withQueryString();
        return view('dashboard.payments', compact('payments'));
    }

    public function confirmPayment(Request $request, Payment $payment)
    {
        $request->validate(['action' => 'required|in:approve,reject']);

        if ($request->action === 'approve') {
            $payment->update(['status' => 'Paid']);
            return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
        } else {
            $payment->update(['status' => 'Unpaid', 'proof_path' => null]);
            return back()->with('error', 'Bukti pembayaran ditolak.');
        }
    }

    // ─── Users ─────────────────────────────────────────────────────────────────

    public function users(Request $request)
    {
        $users = User::with('role')->latest()->paginate(20)->withQueryString();
        return view('dashboard.users', compact('users'));
    }
}
