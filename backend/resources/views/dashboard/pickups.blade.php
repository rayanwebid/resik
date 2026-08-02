@extends('dashboard.layouts.app')
@section('title', 'Permintaan Penjemputan')
@section('content')

<div class="card mb-4">
    <div class="card-body" style="padding:14px 20px;">
        <form method="GET" class="search-bar">
            <select name="status" class="form-control" style="width:auto;">
                <option value="">Semua Status</option>
                @foreach(['menunggu','diproses','dalam perjalanan','selesai','dibatalkan'] as $opt)
                    <option value="{{ $opt }}" {{ request('status') === $opt ? 'selected' : '' }}>{{ ucfirst($opt) }}</option>
                @endforeach
            </select>
            <button type="submit" class="btn btn-primary"><i class="fas fa-filter"></i> Filter</button>
            <a href="{{ route('dashboard.pickups') }}" class="btn btn-ghost">Reset</a>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <div class="card-title"><i class="fas fa-truck" style="color:var(--info); margin-right:8px;"></i>Daftar Permintaan Penjemputan</div>
        <div style="font-size:13px; color:var(--text-muted);">Total: {{ $pickups->total() }}</div>
    </div>
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Pelanggan</th>
                    <th>Tanggal</th>
                    <th>Jenis Sampah</th>
                    <th>Petugas</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
            @forelse($pickups as $i => $req)
            <tr>
                <td style="color:var(--text-muted); font-size:12px;">{{ $req->id }}</td>
                <td style="font-weight:600; font-size:13px;">{{ $req->customer?->user?->name ?? '-' }}</td>
                <td style="font-size:13px;">
                    {{ $req->date ? \Carbon\Carbon::parse($req->date)->format('d M Y') : '-' }}
                    <div style="font-size:11px; color:var(--text-muted);">{{ $req->time ?? '' }}</div>
                </td>
                <td><span class="badge badge-blue">{{ $req->waste_type ?? '-' }}</span></td>
                <td style="font-size:13px;">{{ $req->officer?->name ?? '—' }}</td>
                <td>
                    @php
                        $s = $req->status;
                        $bc = match($s) {
                            'menunggu'          => 'badge-yellow',
                            'diproses'          => 'badge-blue',
                            'dalam perjalanan'  => 'badge-purple',
                            'selesai'           => 'badge-green',
                            'dibatalkan'        => 'badge-red',
                            default             => 'badge-gray',
                        };
                    @endphp
                    <span class="badge {{ $bc }}">{{ ucfirst($s) }}</span>
                </td>
                <td>
                    @if(in_array($req->status, ['menunggu']))
                    <button class="btn btn-sm btn-info" onclick="openAssign({{ $req->id }})">
                        <i class="fas fa-user-check"></i> Tugaskan
                    </button>
                    @else
                    <span style="font-size:12px; color:var(--text-muted);">—</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">
                    <i class="fas fa-truck" style="font-size:32px; display:block; margin-bottom:8px;"></i>
                    Tidak ada penjemputan ditemukan
                </td>
            </tr>
            @endforelse
            </tbody>
        </table>
    </div>
    <div style="padding:12px 20px; border-top:1px solid var(--border);">
        {{ $pickups->links('dashboard.partials.pagination') }}
    </div>
</div>

<!-- Assign Modal -->
<div class="modal-backdrop" id="assignModal">
    <div class="modal">
        <div class="modal-title"><i class="fas fa-user-check" style="color:var(--primary);margin-right:8px;"></i>Tugaskan Petugas</div>
        <div class="modal-sub">Pilih petugas untuk menangani penjemputan ini</div>
        <form method="POST" id="assignForm">
            @csrf
            <div class="form-group">
                <label class="form-label">Pilih Petugas Aktif</label>
                <select name="officer_id" class="form-control" required>
                    <option value="">— Pilih Petugas —</option>
                    @foreach($officers as $off)
                    <option value="{{ $off->id }}">{{ $off->name }} ({{ $off->region ?? 'Umum' }})</option>
                    @endforeach
                </select>
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
                <button type="button" class="btn btn-ghost" onclick="closeAssign()">Batal</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Tugaskan</button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function openAssign(id) {
    document.getElementById('assignForm').action = '/dashboard/pickups/' + id + '/assign';
    document.getElementById('assignModal').classList.add('show');
}
function closeAssign() {
    document.getElementById('assignModal').classList.remove('show');
}
document.getElementById('assignModal').addEventListener('click', function(e) {
    if (e.target === this) closeAssign();
});
</script>
@endpush
@endsection
