@extends('dashboard.layouts.app')
@section('title', 'Manajemen Petugas')
@section('content')

<div class="card mb-4">
    <div class="card-body" style="padding:14px 20px;">
        <form method="GET" class="search-bar">
            <div class="search-input-wrap">
                <i class="fas fa-search icon"></i>
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Cari nama atau wilayah..." class="form-control">
            </div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-filter"></i> Filter</button>
            <a href="{{ route('dashboard.officers') }}" class="btn btn-ghost">Reset</a>
            <a href="{{ route('dashboard.officers.create') }}" class="btn btn-primary ml-auto">
                <i class="fas fa-plus"></i> Tambah Petugas
            </a>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <div class="card-title"><i class="fas fa-hard-hat" style="color:var(--info); margin-right:8px;"></i>Daftar Petugas</div>
        <div style="font-size:13px; color:var(--text-muted);">Total: {{ $officers->total() }} petugas</div>
    </div>
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Petugas</th>
                    <th>NIK</th>
                    <th>Telepon</th>
                    <th>Wilayah</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
            @forelse($officers as $i => $off)
            <tr>
                <td style="color:var(--text-muted); font-size:12px;">{{ $officers->firstItem() + $i }}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#3b82f6,#60a5fa); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:13px; flex-shrink:0;">
                            {{ strtoupper(substr($off->name, 0, 1)) }}
                        </div>
                        <div>
                            <div style="font-weight:600; font-size:13px;">{{ $off->name }}</div>
                            <div style="font-size:11px; color:var(--text-muted);">{{ $off->user?->email ?? '-' }}</div>
                        </div>
                    </div>
                </td>
                <td style="font-size:13px; font-family:monospace;">{{ $off->nik }}</td>
                <td style="font-size:13px;">{{ $off->phone }}</td>
                <td style="font-size:13px;">{{ $off->region ?? '—' }}</td>
                <td>
                    <span class="badge {{ $off->is_active ? 'badge-green' : 'badge-gray' }}">
                        {{ $off->is_active ? 'Aktif' : 'Nonaktif' }}
                    </span>
                </td>
                <td>
                    <form method="POST" action="{{ route('dashboard.officers.toggle', $off) }}">
                        @csrf
                        <button class="btn btn-sm {{ $off->is_active ? 'btn-warning' : 'btn-success' }}">
                            <i class="fas {{ $off->is_active ? 'fa-toggle-off' : 'fa-toggle-on' }}"></i>
                            {{ $off->is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                        </button>
                    </form>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">
                    <i class="fas fa-hard-hat" style="font-size:32px; display:block; margin-bottom:8px;"></i>
                    Belum ada petugas terdaftar
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>
    <div style="padding:12px 20px; border-top:1px solid var(--border);">
        {{ $officers->links('dashboard.partials.pagination') }}
    </div>
</div>
@endsection
