@extends('dashboard.layouts.app')
@section('title', 'Dashboard')
@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    // Revenue Chart
    const ctx = document.getElementById('revenueChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: {!! json_encode(array_column($monthly_revenue, 'month')) !!},
                datasets: [{
                    label: 'Pendapatan (Rp)',
                    data: {!! json_encode(array_column($monthly_revenue, 'revenue')) !!},
                    backgroundColor: 'rgba(22,163,74,0.15)',
                    borderColor: '#16a34a',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(22,163,74,0.3)',
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: {
                    callbacks: { label: (c) => ' Rp ' + Number(c.raw).toLocaleString('id-ID') }
                }},
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' },
                         ticks: { callback: (v) => 'Rp ' + (v/1000).toFixed(0) + 'K' }},
                    x: { grid: { display: false }}
                }
            }
        });
    }
});
</script>
@endpush
@section('content')
<!-- Stats Grid -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-users"></i></div>
        <div>
            <div class="stat-label">Total Pelanggan</div>
            <div class="stat-value">{{ number_format($stats['total_customers']) }}</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-hard-hat"></i></div>
        <div>
            <div class="stat-label">Total Petugas</div>
            <div class="stat-value">{{ number_format($stats['total_officers']) }}</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
        <div>
            <div class="stat-label">Menunggu Persetujuan</div>
            <div class="stat-value">{{ number_format($stats['pending_approvals']) }}</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon teal"><i class="fas fa-truck"></i></div>
        <div>
            <div class="stat-label">Permintaan Aktif</div>
            <div class="stat-value">{{ number_format($stats['active_requests']) }}</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-file-invoice-dollar"></i></div>
        <div>
            <div class="stat-label">Tagihan Belum Bayar</div>
            <div class="stat-value">{{ number_format($stats['unpaid_bills']) }}</div>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon purple"><i class="fas fa-coins"></i></div>
        <div>
            <div class="stat-label">Total Pendapatan</div>
            <div class="stat-value" style="font-size:18px;">Rp {{ number_format($stats['total_revenue'], 0, ',', '.') }}</div>
        </div>
    </div>
</div>

<!-- Revenue Chart + Pending Customers -->
<div style="display:grid; grid-template-columns: 1fr 380px; gap:20px; margin-bottom:20px;">
    <div class="card">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-chart-bar" style="color:var(--primary); margin-right:8px;"></i>Pendapatan 6 Bulan Terakhir</div>
        </div>
        <div class="card-body" style="height:260px; padding:16px;">
            <canvas id="revenueChart"></canvas>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-user-clock" style="color:var(--warning); margin-right:8px;"></i>Menunggu Persetujuan</div>
            <a href="{{ route('dashboard.customers') }}?status=pending" class="btn btn-sm btn-ghost">Lihat semua</a>
        </div>
        <div style="overflow-y:auto; max-height:280px;">
            @forelse($pending_customers as $user)
            <div style="padding:12px 16px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px;">
                <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#f59e0b,#fbbf24); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; flex-shrink:0;">
                    {{ strtoupper(substr($user->name, 0, 1)) }}
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ $user->name }}</div>
                    <div style="font-size:11px; color:var(--text-muted);">{{ $user->email }}</div>
                </div>
                <form method="POST" action="{{ route('dashboard.customers.approve', $user) }}">
                    @csrf
                    <button class="btn btn-sm btn-success" type="submit" title="Setujui">
                        <i class="fas fa-check"></i>
                    </button>
                </form>
            </div>
            @empty
            <div style="padding:32px; text-align:center; color:var(--text-muted); font-size:13px;">
                <i class="fas fa-check-circle" style="font-size:28px; color:#22c55e; display:block; margin-bottom:8px;"></i>
                Tidak ada pelanggan menunggu
            </div>
            @endforelse
        </div>
    </div>
</div>

<!-- Recent Requests + Recent Payments -->
<div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
    <div class="card">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-truck" style="color:var(--info); margin-right:8px;"></i>Permintaan Terbaru</div>
            <a href="{{ route('dashboard.pickups') }}" class="btn btn-sm btn-ghost">Lihat semua</a>
        </div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>Pelanggan</th><th>Jenis</th><th>Status</th></tr></thead>
                <tbody>
                @forelse($recent_requests as $req)
                <tr>
                    <td style="font-weight:500; font-size:13px;">{{ $req->customer?->user?->name ?? '-' }}</td>
                    <td><span class="badge badge-blue">{{ $req->waste_type }}</span></td>
                    <td>
                        @php
                            $s = $req->status;
                            $bc = match($s) {
                                'menunggu' => 'badge-yellow',
                                'diproses','dalam perjalanan' => 'badge-blue',
                                'selesai' => 'badge-green',
                                'dibatalkan' => 'badge-red',
                                default => 'badge-gray',
                            };
                        @endphp
                        <span class="badge {{ $bc }}">{{ ucfirst($s) }}</span>
                    </td>
                </tr>
                @empty
                <tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:24px; font-size:13px;">Belum ada permintaan</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-credit-card" style="color:var(--primary); margin-right:8px;"></i>Pembayaran Terbaru</div>
            <a href="{{ route('dashboard.payments') }}" class="btn btn-sm btn-ghost">Lihat semua</a>
        </div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>Pelanggan</th><th>Jumlah</th><th>Status</th></tr></thead>
                <tbody>
                @forelse($recent_payments as $pay)
                <tr>
                    <td style="font-weight:500; font-size:13px;">{{ $pay->customer?->user?->name ?? '-' }}</td>
                    <td style="font-size:13px;">Rp {{ number_format($pay->amount, 0, ',', '.') }}</td>
                    <td>
                        <span class="badge {{ $pay->status === 'Paid' ? 'badge-green' : ($pay->status === 'Pending' ? 'badge-yellow' : 'badge-red') }}">
                            {{ $pay->status }}
                        </span>
                    </td>
                </tr>
                @empty
                <tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:24px; font-size:13px;">Belum ada pembayaran</td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
