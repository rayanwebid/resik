@extends('dashboard.layouts.app')
@section('title', 'Tambah Petugas')
@section('content')

<div style="max-width:640px; margin:0 auto;">
    <div style="margin-bottom:20px;">
        <a href="{{ route('dashboard.officers') }}" class="btn btn-ghost btn-sm">
            <i class="fas fa-arrow-left"></i> Kembali
        </a>
    </div>

    <div class="card">
        <div class="card-header">
            <div class="card-title"><i class="fas fa-user-plus" style="color:var(--primary); margin-right:8px;"></i>Tambah Petugas Baru</div>
        </div>
        <div class="card-body">
            <form method="POST" action="{{ route('dashboard.officers.store') }}">
                @csrf
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Nama Lengkap *</label>
                        <input type="text" name="name" class="form-control" value="{{ old('name') }}" placeholder="Budi Santoso" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">NIK *</label>
                        <input type="text" name="nik" class="form-control" value="{{ old('nik') }}" placeholder="3271234567890001" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email *</label>
                        <input type="email" name="email" class="form-control" value="{{ old('email') }}" placeholder="petugas@sisampah.id" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nomor Telepon *</label>
                        <input type="text" name="phone" class="form-control" value="{{ old('phone') }}" placeholder="08123456789" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password *</label>
                        <input type="password" name="password" class="form-control" placeholder="Min. 6 karakter" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Konfirmasi Password *</label>
                        <input type="password" name="password_confirmation" class="form-control" placeholder="Ulangi password" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Alamat *</label>
                    <textarea name="address" class="form-control" rows="2" placeholder="Jl. Contoh No.1, RT01/RW02..." required>{{ old('address') }}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Wilayah Tugas</label>
                    <input type="text" name="region" class="form-control" value="{{ old('region') }}" placeholder="Contoh: Kelurahan Sukamaju">
                </div>

                <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:8px;">
                    <a href="{{ route('dashboard.officers') }}" class="btn btn-ghost">Batal</a>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Simpan Petugas
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
