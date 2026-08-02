@extends('dashboard.layouts.app')
@section('title', 'Manajemen Pelanggan')
@section('content')

<div class="card mb-4">
    <div class="card-body" style="padding:14px 20px;">
        <form method="GET" class="search-bar">
            <div class="search-input-wrap">
                <i class="fas fa-search icon"></i>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama atau email..." class="form-control">
            </div>
            <select name="status" class="form-control" style="width:auto;">
                <option value="">Semua Status</option>
                <option value="active"   {{ request('status') === 'active'   ? 'selected' : '' }}>Aktif</option>
                <option value="pending"  {{ request('status') === 'pending'  ? 'selected' : '' }}>Menunggu</option>
                <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Ditolak</option>
            </select>
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-filter"></i> Filter
            </button>
            <a href="{{ route('dashboard.customers') }}" class="btn btn-ghost">Reset</a>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <div class="card-title"><i class="fas fa-users" style="color:var(--primary); margin-right:8px;"></i>Daftar Pelanggan</div>
        <div style="font-size:13px; color:var(--text-muted);">Total: {{ $customers->total() }} pelanggan</div>
    </div>
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Pelanggan</th>
                    <th>Telepon</th>
                    <th>Alamat</th>
                    <th>Daftar</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
            @forelse($customers as $i => $cust)
            <tr>
                <td style="color:var(--text-muted); font-size:12px;">{{ $customers->firstItem() + $i }}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#16a34a,#22c55e); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; flex-shrink:0;">
                            {{ strtoupper(substr($cust->user?->name ?? 'U', 0, 1)) }}
                        </div>
                        <div>
                            <div style="font-weight:600; font-size:13px;">{{ $cust->user?->name ?? '-' }}</div>
                            <div style="font-size:11px; color:var(--text-muted);">{{ $cust->user?->email ?? '-' }}</div>
                        </div>
                    </div>
                </td>
                <td style="font-size:13px;">{{ $cust->phone ?? '-' }}</td>
                <td style="font-size:12px; color:var(--text-muted); max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ $cust->address ?? '-' }}</td>
                <td style="font-size:12px; color:var(--text-muted);">{{ $cust->created_at?->format('d M Y') }}</td>
                <td>
                    @php $s = $cust->user?->status ?? 'unknown'; @endphp
                    <span class="badge {{ match($s) {'active'=>'badge-green','pending'=>'badge-yellow','rejected'=>'badge-red',default=>'badge-gray'} }}">
                        {{ ucfirst($s) }}
                    </span>
                </td>
                <td>
                    @if($cust->user?->status === 'pending')
                    <div style="display:flex; gap:6px;">
                        <form method="POST" action="{{ route('dashboard.customers.approve', $cust->user) }}">
                            @csrf
                            <button class="btn btn-sm btn-success" title="Setujui"><i class="fas fa-check"></i> Setujui</button>
                        </form>
                        <form method="POST" action="{{ route('dashboard.customers.reject', $cust->user) }}">
                            @csrf
                            <button class="btn btn-sm btn-danger" title="Tolak"><i class="fas fa-times"></i></button>
                        </form>
                    </div>
                    @else
                    <span style="font-size:12px; color:var(--text-muted);">—</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">
                    <i class="fas fa-users-slash" style="font-size:32px; display:block; margin-bottom:8px;"></i>
                    Tidak ada pelanggan ditemukan
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>
    <div style="padding:12px 20px; border-top:1px solid var(--border);">
        {{ $customers->links('dashboard.partials.pagination') }}
    </div>
</div>
@endsection
