@extends('dashboard.layouts.app')
@section('title', 'Semua Pengguna')
@section('content')
<div class="card">
    <div class="card-header">
        <div class="card-title"><i class="fas fa-shield-halved" style="color:var(--primary); margin-right:8px;"></i>Semua Pengguna Sistem</div>
        <div style="font-size:13px; color:var(--text-muted);">Total: {{ $users->total() }}</div>
    </div>
    <div class="table-wrap">
        <table>
            <thead>
                <tr><th>#</th><th>Pengguna</th><th>Role</th><th>Status</th><th>Bergabung</th></tr>
            </thead>
            <tbody>
            @forelse($users as $i => $user)
            <tr>
                <td style="color:var(--text-muted); font-size:12px;">{{ $users->firstItem() + $i }}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; flex-shrink:0;">
                            {{ strtoupper(substr($user->name, 0, 1)) }}
                        </div>
                        <div>
                            <div style="font-weight:600; font-size:13px;">{{ $user->name }}</div>
                            <div style="font-size:11px; color:var(--text-muted);">{{ $user->email }}</div>
                        </div>
                    </div>
                </td>
                <td>
                    @php
                        $roleSlug = $user->role?->slug ?? 'unknown';
                        $roleLabel = $user->role?->name ?? 'Unknown';
                        $roleBadge = match($roleSlug) {
                            'super-admin' => 'badge-purple',
                            'petugas'     => 'badge-blue',
                            'pelanggan'   => 'badge-green',
                            default       => 'badge-gray',
                        };
                    @endphp
                    <span class="badge {{ $roleBadge }}">{{ $roleLabel }}</span>
                </td>
                <td>
                    <span class="badge {{ match($user->status) {'active'=>'badge-green','pending'=>'badge-yellow','rejected'=>'badge-red',default=>'badge-gray'} }}">
                        {{ ucfirst($user->status ?? 'unknown') }}
                    </span>
                </td>
                <td style="font-size:12px; color:var(--text-muted);">{{ $user->created_at?->format('d M Y') }}</td>
            </tr>
            @empty
            <tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada pengguna</td></tr>
            @endforelse
            </tbody>
        </table>
    </div>
    <div style="padding:12px 20px; border-top:1px solid var(--border);">
        {{ $users->links('dashboard.partials.pagination') }}
    </div>
</div>
@endsection
