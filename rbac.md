# RBAC Flow.md

# Role Based Access Control (RBAC)

## Sistem Informasi Sampah

Versi : 1.0

---

# 1. Pendahuluan

Role Based Access Control (RBAC) digunakan untuk membatasi hak akses setiap pengguna berdasarkan peran (role) yang dimiliki sehingga keamanan sistem lebih terjamin dan setiap pengguna hanya dapat mengakses fitur sesuai tanggung jawabnya.

---

# 2. Role Sistem

Terdapat tiga role utama pada sistem.

```
Super Admin
│
├── Mengelola seluruh sistem
├── Monitoring Petugas
├── Monitoring Pelanggan
├── CMS
└── Pengaturan Website

Petugas Sampah
│
├── Melihat Jadwal
├── Mengambil Sampah
├── Update Lokasi
├── Upload Dokumentasi
└── Riwayat Tugas

Pelanggan
│
├── Registrasi
├── Login
├── Permintaan Pengambilan
├── Pembayaran
└── Riwayat
```

---

# 3. Diagram RBAC

```text
                   +----------------------+
                   |      Guest User      |
                   +----------+-----------+
                              |
                  Login / Register
                              |
                +-------------+-------------+
                |                           |
          Pelanggan                  Petugas Sampah
                |                           |
                +-------------+-------------+
                              |
                        Super Admin
```

---

# 4. Authentication Flow

```text
User
 │
 │ Login
 ▼
Authentication
 │
 ├── Email
 ├── Password
 │
 ▼
Validasi
 │
 ├── Salah
 │      │
 │      └── Login Gagal
 │
 └── Benar
        │
        ▼
     Ambil Role
        │
        ├── Super Admin
        ├── Petugas
        └── Pelanggan
        │
        ▼
Dashboard Sesuai Role
```

---

# 5. Authorization Flow

```text
Request Endpoint
        │
        ▼
Middleware Authentication
        │
        ▼
Middleware Role
        │
        ▼
Cek Permission
        │
        ├── Tidak Memiliki
        │        │
        │        └── 403 Forbidden
        │
        └── Memiliki
                 │
                 ▼
            Jalankan Request
```

---

# 6. Role Matrix

| Modul                     | Super Admin | Petugas | Pelanggan |
| ------------------------- | :---------: | :-----: | :-------: |
| Dashboard                 |      ✅      |    ✅    |     ✅     |
| Profil                    |      ✅      |    ✅    |     ✅     |
| Edit Profil               |      ✅      |    ✅    |     ✅     |
| Login                     |      ✅      |    ✅    |     ✅     |
| Logout                    |      ✅      |    ✅    |     ✅     |
| Ganti Password            |      ✅      |    ✅    |     ✅     |
| Manajemen User            |      ✅      |    ❌    |     ❌     |
| Role Permission           |      ✅      |    ❌    |     ❌     |
| Monitoring Petugas        |      ✅      |    ❌    |     ❌     |
| Monitoring Pelanggan      |      ✅      |    ❌    |     ❌     |
| Tracking GPS              |      ✅      |    ✅    |     ❌     |
| Penggajian                |      ✅      |    ❌    |     ❌     |
| Kelola Petugas            |      ✅      |    ❌    |     ❌     |
| Kelola Pelanggan          |      ✅      |    ❌    |     ❌     |
| CMS                       |      ✅      |    ❌    |     ❌     |
| Slider                    |      ✅      |    ❌    |     ❌     |
| Berita                    |      ✅      |    ❌    |     ❌     |
| Galeri                    |      ✅      |    ❌    |     ❌     |
| Pengaturan Website        |      ✅      |    ❌    |     ❌     |
| Laporan                   |      ✅      |    ❌    |     ❌     |
| Approval Pelanggan        |      ✅      |    ❌    |     ❌     |
| Jadwal Pengambilan        |      ✅      |    ✅    |     ❌     |
| Update Status Pengambilan |      ✅      |    ✅    |     ❌     |
| Upload Foto Pengambilan   |      ✅      |    ✅    |     ❌     |
| Update Lokasi GPS         |      ❌      |    ✅    |     ❌     |
| Melihat Daftar Tugas      |      ❌      |    ✅    |     ❌     |
| Riwayat Tugas             |      ❌      |    ✅    |     ❌     |
| Permintaan Pengambilan    |      ❌      |    ❌    |     ✅     |
| Pembayaran                |      ❌      |    ❌    |     ✅     |
| Upload Bukti Bayar        |      ❌      |    ❌    |     ✅     |
| Riwayat Pengambilan       |      ❌      |    ❌    |     ✅     |
| Notifikasi                |      ✅      |    ✅    |     ✅     |

---

# 7. Permission List

## User Management

```
user.view
user.create
user.update
user.delete
```

---

## Role Management

```
role.view
role.create
role.update
role.delete
```

---

## Permission Management

```
permission.view
permission.create
permission.update
permission.delete
```

---

## Pelanggan

```
customer.view
customer.create
customer.update
customer.delete
customer.approval
```

---

## Petugas

```
officer.view
officer.create
officer.update
officer.delete
officer.salary
officer.location
officer.schedule
```

---

## Pengambilan Sampah

```
pickup.view
pickup.create
pickup.update
pickup.delete
pickup.assign
pickup.complete
pickup.cancel
```

---

## Pembayaran

```
payment.view
payment.create
payment.update
payment.confirm
payment.export
```

---

## Tracking GPS

```
tracking.view
tracking.update
tracking.history
tracking.realtime
```

---

## CMS

```
cms.slider
cms.banner
cms.news
cms.activity
cms.gallery
cms.page
cms.menu
cms.footer
cms.header
cms.faq
cms.partner
cms.testimonial
```

---

## Website Setting

```
setting.website
setting.logo
setting.menu
setting.footer
setting.header
setting.smtp
setting.googlemaps
setting.whatsapp
setting.seo
```

---

## Laporan

```
report.customer
report.payment
report.pickup
report.salary
report.officer
report.export
```

---

# 8. Flow Super Admin

```text
Login
   │
Dashboard
   │
   ├── Monitoring Map
   ├── Monitoring Petugas
   ├── Monitoring Pelanggan
   ├── Pembayaran
   ├── Penggajian
   ├── CMS
   ├── Pengaturan Website
   ├── Laporan
   └── Logout
```

---

# 9. Flow Petugas

```text
Login
   │
Dashboard
   │
   ├── Daftar Tugas
   ├── Lihat Lokasi Pelanggan
   ├── Navigasi Google Maps
   ├── Ambil Sampah
   ├── Upload Foto Sebelum
   ├── Upload Foto Sesudah
   ├── Input Berat Sampah
   ├── Update Status
   ├── Update GPS
   └── Logout
```

---

# 10. Flow Pelanggan

```text
Register
    │
Verifikasi Admin
    │
Login
    │
Dashboard
    │
    ├── Ajukan Pengambilan
    ├── Tracking Status
    ├── Riwayat
    ├── Pembayaran
    ├── Upload Bukti
    ├── Notifikasi
    └── Logout
```

---

# 11. Middleware Laravel

```
auth

verified

role:super-admin

role:petugas

role:pelanggan

permission:user.view

permission:pickup.create

permission:tracking.view

permission:cms.news

permission:setting.website
```

---

# 12. Struktur Role Database

```
roles
-----
id
name
slug
description
created_at
updated_at

permissions
-----------
id
name
slug
module
created_at
updated_at

role_permissions
----------------
role_id
permission_id

users
-----
id
role_id
name
email
password
status
```

---

# 13. Keamanan RBAC

* Semua endpoint API dilindungi middleware `auth:sanctum`.
* Pemeriksaan role dilakukan sebelum pemeriksaan permission.
* Seluruh aktivitas penting (login, perubahan data, penghapusan, persetujuan, pembayaran, dan penggajian) dicatat pada **Audit Log**.
* Akses langsung ke URL tanpa hak yang sesuai akan menghasilkan respons **HTTP 403 Forbidden**.
* Pengguna hanya dapat melihat dan memodifikasi data yang menjadi kewenangannya sesuai role dan permission yang dimiliki.
