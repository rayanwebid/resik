@extends('dashboard.layouts.app')
@section('title', 'Manajemen Pembayaran')
@section('content')

<div class="card mb-4">
    <div class="card-body" style="padding:14px 20px;">
        <form method="GET" class="search-bar">
            <select name="status" class="form-control" style="width:auto;">
                <option value="">Semua Status</option>
                <option value="Unpaid"  {{ request('status') === 'Unpaid'  ? 'selected' : '' }}>Belum Bayar</option>
                <option value="Pending" {{ request('status') === 'Pending' ? 'selected' : '' }}>Menunggu Konfirmasi</option>
                <option value="Paid"    {{ request('status') === 'Paid'    ? 'selected' : '' }}>Sudah Bayar</option>
            </select>
            <button type="submit" class="btn btn-primary"><i class="fas fa-filter"></i> Filter</button>
            <a href="{{ route('dashboard.payments') }}" class="btn btn-ghost">Reset</a>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <div class="card-title"><i class="fas fa-credit-card" style="color:var(--primary); margin-right:8px;"></i>Riwayat Pembayaran</div>
        <div style="font-size:13px; color:var(--text-muted);">Total: {{ $payments->total() }}</div>
    </div>
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Pelanggan</th>
                    <th>Periode</th>
                    <th>Jumlah</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
            @forelse($payments as $i => $pay)
            <tr>
                <td style="color:var(--text-muted); font-size:12px;">{{ $pay->id }}</td>
                <td style="font-weight:600; font-size:13px;">{{ $pay->customer?->user?->name ?? '-' }}</td>
                <td style="font-size:13px; color:var(--text-muted);">
                    @if($pay->month && $pay->year)
                        {{ \Carbon\Carbon::create($pay->year, $pay->month)->isoFormat('MMMM Y') }}
                    @else —
                    @endif
                </td>
                <td style="font-weight:700; font-size:13px;">Rp {{ number_format($pay->amount, 0, ',', '.') }}</td>
                <td style="font-size:12px;">{{ $pay->payment_method ?? '—' }}</td>
                <td>
                    <span class="badge {{ match($pay->status) {'Paid'=>'badge-green','Pending'=>'badge-yellow','Unpaid'=>'badge-red',default=>'badge-gray'} }}">
                        {{ $pay->status === 'Paid' ? 'Lunas' : ($pay->status === 'Pending' ? 'Menunggu' : 'Belum Bayar') }}
                    </span>
                </td>
                <td>
                    @if($pay->status === 'Pending')
                    <div style="display:flex; gap:6px;">
                        <form method="POST" action="{{ route('dashboard.payments.confirm', $pay) }}">
                            @csrf
                            <input type="hidden" name="action" value="approve">
                            <button class="btn btn-sm btn-success" title="Konfirmasi">
                                <i class="fas fa-check"></i> Konfirmasi
                            </button>
                        </form>
                        <form method="POST" action="{{ route('dashboard.payments.confirm', $pay) }}">
                            @csrf
                            <input type="hidden" name="action" value="reject">
                            <button class="btn btn-sm btn-danger" title="Tolak">
                                <i class="fas fa-times"></i>
                            </button>
                        </form>
                    </div>
                    @elseif($pay->proof_path)
                        <a href="{{ asset('storage/' . $pay->proof_path) }}" target="_blank" class="btn btn-sm btn-ghost">
                            <i class="fas fa-image"></i> Bukti
                        </a>
                    @else
                        <span style="font-size:12px; color:var(--text-muted);">—</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">
                    <i class="fas fa-credit-card" style="font-size:32px; display:block; margin-bottom:8px;"></i>
                    Tidak ada pembayaran ditemukan
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>
    <div style="padding:12px 20px; border-top:1px solid var(--border);">
        {{ $payments->links('dashboard.partials.pagination') }}
    </div>
</div>
@endsection
