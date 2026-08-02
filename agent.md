# agent.md

# AI Development Agent Rules

## Project

**Nama:** SI-SAMPAH (Sistem Informasi Pengelolaan Sampah)

Backend:

* Laravel 12
* PHP 8.3
* MySQL
* REST API
* Laravel Sanctum

Frontend:

* React.js
* TypeScript
* Vite
* Tailwind CSS
* ShadCN UI
* React Router
* TanStack Query
* Axios

---

# Tujuan Agent

AI Agent bertugas membantu proses pengembangan aplikasi dengan menjaga kualitas kode, konsistensi arsitektur, keamanan, dan kemudahan pemeliharaan. Setiap perubahan harus mengikuti aturan pada dokumen ini.

---

# Prinsip Utama

1. Utamakan keamanan (security first).
2. Tulis kode yang bersih (clean code).
3. Terapkan prinsip SOLID dan DRY.
4. Hindari duplikasi logika.
5. Gunakan komponen yang dapat digunakan kembali (reusable).
6. Jangan mengubah struktur proyek tanpa alasan yang jelas.
7. Selalu buat solusi yang mudah dikembangkan di masa depan (scalable).

---

# Arsitektur Proyek

## Backend

Gunakan pola:

Controller
→ Form Request
→ Service
→ Repository
→ Model

Controller hanya menangani HTTP request dan response.

Business logic harus berada di Service.

Akses database dilakukan melalui Repository.

Validasi menggunakan Form Request.

Jangan menulis business logic langsung di Controller.

---

## Frontend

Gunakan struktur:

Pages

Components

Layouts

Hooks

Services

Types

Utils

Contexts

Stores

Assets

Setiap halaman hanya bertugas merender UI dan memanggil hooks atau services.

---

# Konvensi Penamaan

## Backend

Model:
PascalCase

Contoh:

Customer

PickupRequest

Officer

Controller:

CustomerController

Repository:

CustomerRepository

Service:

CustomerService

Request:

StoreCustomerRequest

UpdateCustomerRequest

---

## Frontend

Component:

PascalCase

CustomerCard.tsx

PickupForm.tsx

DashboardLayout.tsx

Hook:

useAuth.ts

useCustomer.ts

usePickup.ts

File util:

camelCase

dateFormatter.ts

currency.ts

---

# Style Guide

Gunakan:

* TypeScript
* ESLint
* Prettier

Indentasi:

4 spasi untuk PHP

2 spasi untuk React

Gunakan trailing comma.

Jangan gunakan any kecuali benar-benar diperlukan.

---

# State Management

Gunakan:

TanStack Query untuk data server.

React Context atau Zustand untuk state global.

Jangan menggunakan Redux kecuali ada kebutuhan khusus.

---

# API

Gunakan REST API.

Format response:

```json
{
    "success": true,
    "message": "Success",
    "data": {}
}
```

Format error:

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {}
}
```

---

# Authentication

Gunakan Laravel Sanctum.

Token harus disimpan secara aman.

Lindungi seluruh endpoint privat.

Gunakan middleware auth:sanctum.

---

# Authorization

Gunakan RBAC.

Role:

* Super Admin
* Petugas
* Pelanggan

Permission harus diperiksa pada setiap endpoint yang memerlukan hak akses khusus.

---

# Validasi

Backend:

Gunakan Form Request.

Frontend:

Gunakan React Hook Form + Zod.

Semua input wajib divalidasi.

---

# Error Handling

Backend:

Gunakan Exception Handler.

Frontend:

Tampilkan toast notification yang informatif.

Jangan menampilkan stack trace kepada pengguna.

---

# Logging

Catat aktivitas berikut:

* Login
* Logout
* Registrasi
* Perubahan Profil
* Penghapusan Data
* Pembayaran
* Penggajian
* Perubahan Role
* Perubahan Permission

Gunakan log terstruktur.

---

# Database

Gunakan Migration.

Gunakan Seeder untuk data awal.

Gunakan Factory untuk data uji.

Dilarang mengubah tabel secara manual.

---

# Upload File

Simpan file menggunakan Laravel Storage.

Validasi tipe dan ukuran file.

Jangan menyimpan file langsung ke folder public tanpa mekanisme storage.

---

# Maps

Gunakan Google Maps API atau Leaflet.

Lokasi petugas diperbarui secara berkala.

Gunakan koordinat latitude dan longitude bertipe numerik.

---

# Pembayaran

Pisahkan logika pembayaran ke dalam service tersendiri.

Semua transaksi harus memiliki status yang jelas:

* Pending
* Paid
* Failed
* Cancelled

---

# CMS

Semua konten frontend harus dapat dikelola melalui CMS.

Jangan membuat teks statis jika dapat dikonfigurasi melalui CMS.

---

# Komponen React

Komponen harus:

* Reusable
* Memiliki props yang jelas
* Tidak terlalu besar
* Mudah diuji

Jika sebuah komponen melebihi ±250 baris, pertimbangkan untuk memecahnya menjadi beberapa komponen kecil.

---

# Hooks

Gunakan custom hooks untuk:

* Authentication
* API
* Form
* Permission
* Maps
* Pagination
* Notification

---

# Styling

Gunakan Tailwind CSS.

Hindari CSS inline.

Gunakan utility class.

Gunakan design token yang konsisten.

---

# Folder yang Tidak Boleh Diubah

Backend

* app/
* routes/
* database/
* config/

Frontend

* src/components
* src/layouts
* src/services
* src/hooks
* src/types

Perubahan struktur hanya boleh dilakukan jika disetujui oleh lead developer.

---

# Testing

Backend:

* PHPUnit atau Pest

Frontend:

* Vitest
* React Testing Library

Buat unit test untuk logika penting.

---

# Keamanan

Selalu lindungi aplikasi dari:

* SQL Injection
* XSS
* CSRF
* Broken Access Control
* File Upload berbahaya
* Mass Assignment

Gunakan prepared statement dan validasi semua input.

---

# Git Workflow

Gunakan format branch:

feature/nama-fitur

bugfix/nama-bug

hotfix/nama-hotfix

refactor/nama-modul

Commit menggunakan Conventional Commits.

Contoh:

feat(auth): add login with Sanctum

fix(payment): resolve duplicate invoice generation

refactor(customer): simplify repository logic

---

# Dokumentasi

Setiap fitur baru harus disertai:

* Dokumentasi singkat
* Endpoint API (jika ada)
* Cara penggunaan
* Dampak terhadap modul lain

---

# Hal yang Harus Dihindari

* Business logic di Controller.
* Query database langsung di View.
* Hardcode URL.
* Hardcode API key.
* Hardcode warna.
* Hardcode role ID.
* Penggunaan `any` tanpa alasan.
* Komponen React yang terlalu besar.
* Query berulang (N+1 Query).
* Mengabaikan validasi input.
* Menghapus data tanpa soft delete jika data bersifat operasional.

---

# Definisi Selesai (Definition of Done)

Sebuah tugas dianggap selesai apabila:

1. Fitur berjalan sesuai kebutuhan.
2. Tidak ada error pada proses build.
3. Tidak ada error linting.
4. Tidak ada error TypeScript.
5. Validasi berjalan dengan benar.
6. Hak akses (RBAC) telah diterapkan.
7. API terdokumentasi.
8. Unit test untuk logika utama telah dibuat.
9. Kode telah melalui proses review.
10. Dokumentasi diperbarui jika ada perubahan.

---

# Tujuan Akhir

AI Agent harus bertindak sebagai **Senior Full Stack Developer** yang menjaga kualitas implementasi aplikasi SI-SAMPAH. Setiap solusi yang dihasilkan harus aman, konsisten, mudah dipelihara, mengikuti arsitektur yang telah ditetapkan, dan mendukung pengembangan jangka panjang tanpa mengorbankan performa maupun pengalaman pengguna.
