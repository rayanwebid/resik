# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# Sistem Informasi Pengelolaan Sampah Berbasis Web

### Versi 1.0

---

# 1. Informasi Produk

**Nama Produk**
SI-SAMPAH (Sistem Informasi Pengelolaan Sampah Digital)

**Platform**

* Website Responsive
* Backend API (Laravel)
* Frontend (React.js)

**Teknologi**

### Backend

* Laravel 12
* PHP 8.3+
* MySQL/MariaDB
* Laravel Sanctum/JWT Authentication
* Laravel Queue
* Laravel Scheduler
* REST API

### Frontend

* React JS
* Vite
* React Router
* Axios
* Tailwind CSS
* ShadCN UI / Material UI
* React Leaflet / Google Maps API

### Pendukung

* Redis (Cache)
* Firebase Cloud Messaging (Notifikasi)
* Google Maps API
* WhatsApp API (Opsional)
* Cloud Storage

---

# 2. Latar Belakang

Banyak masyarakat yang mengalami kesulitan ketika ingin membuang sampah rumah tangga karena belum tersedia sistem pemesanan pengambilan sampah secara digital.

Di sisi lain, penyedia jasa pengangkutan sampah juga mengalami kesulitan dalam mengatur jadwal pengambilan, mengetahui lokasi pelanggan, melakukan monitoring petugas di lapangan, serta mengelola pembayaran pelanggan.

Aplikasi ini dibuat sebagai solusi digital yang menghubungkan masyarakat dengan penyedia layanan pengelolaan sampah sehingga seluruh proses mulai dari pendaftaran pelanggan, pemesanan pengambilan sampah, monitoring petugas, pembayaran hingga laporan dapat dilakukan secara online.

---

# 3. Tujuan

* Mempermudah masyarakat mendaftar sebagai pelanggan.
* Mempermudah permintaan pengambilan sampah.
* Monitoring petugas secara realtime.
* Digitalisasi pembayaran.
* Monitoring kinerja petugas.
* Manajemen pelanggan.
* Dashboard laporan.
* CMS untuk mengelola website.

---

# 4. Target Pengguna

## Super Admin

Mengelola seluruh sistem.

## Petugas Sampah

Mengambil sampah pelanggan sesuai rute.

## Pelanggan

Mengajukan pengambilan sampah.

## Pengunjung Website

Melihat informasi perusahaan dan melakukan pendaftaran.

---

# 5. Hak Akses Sistem

| Role           | Hak Akses                                   |
| -------------- | ------------------------------------------- |
| Super Admin    | Semua fitur                                 |
| Petugas Sampah | Jadwal, Lokasi, Status Pengambilan          |
| Pelanggan      | Permintaan Pengambilan, Pembayaran, Riwayat |

---

# 6. Struktur Website (Frontend)

## HOME

Berisi:

* Hero Slider
* Company Profile
* Mengapa Memilih Kami
* Cara Kerja
* Statistik
* Berita Terbaru
* Kegiatan
* Testimoni
* Mitra
* Footer

---

## HEADER MENU

* Home
* Profil
* Layanan
* Berita
* Kegiatan
* FAQ
* Syarat Bergabung
* Kontak
* Login
* Daftar

Header bersifat sticky.

---

## FOOTER

* Logo
* Tentang Kami
* Alamat
* Telepon
* Email
* Sosial Media
* Quick Menu
* Copyright

---

# 7. Halaman Frontend

## 7.1 Home

Menampilkan:

* Slider
* Tentang Perusahaan
* Layanan
* Alur Pelayanan
* Berita
* Galeri
* Statistik
* CTA Daftar

---

## 7.2 Profil Perusahaan

Isi:

* Sejarah
* Visi
* Misi
* Struktur Organisasi
* Legalitas
* Tim

---

## 7.3 Layanan

Menampilkan:

* Pengambilan Sampah Rumah
* Sampah Organik
* Sampah Anorganik
* Jadwal Pengambilan
* Area Layanan

---

## 7.4 Berita

* List berita
* Detail berita
* Share berita
* Pencarian

---

## 7.5 Kegiatan

* Dokumentasi
* Album
* Video
* Event

---

## 7.6 FAQ

Pertanyaan umum pelanggan.

---

## 7.7 Syarat Bergabung

Persyaratan pelanggan.

Contoh:

* Fotokopi KTP
* Nomor HP
* Lokasi Rumah
* Foto Rumah (Opsional)

---

# 8. Login

Email/No HP

Password

Remember Me

Lupa Password

---

# 9. Registrasi

Field:

Nama

Email

No HP

Password

Konfirmasi Password

Alamat

Provinsi

Kabupaten

Kecamatan

Kelurahan

Kode Pos

Latitude

Longitude

Foto Rumah

Jenis Pelanggan

Setelah registrasi pelanggan menunggu verifikasi admin.

---

# 10. Dashboard Pelanggan

Menu:

Dashboard

Profil

Permintaan Pengambilan

Riwayat Pengambilan

Pembayaran

Notifikasi

Pengaturan Akun

Logout

---

# 11. Permintaan Pengambilan Sampah

Input:

Tanggal

Jam

Jenis Sampah

Estimasi Berat

Catatan

Upload Foto

Lokasi GPS

Status:

Menunggu

Diproses

Dalam Perjalanan

Sudah Diambil

Selesai

---

# 12. Riwayat Pengambilan

Data:

Tanggal

Petugas

Berat

Biaya

Status

Foto

Invoice

---

# 13. Pembayaran

Tagihan Bulanan

Status

Belum Bayar

Lunas

Metode:

Transfer

QRIS

Cash

Virtual Account

Upload Bukti

---

# 14. Dashboard Petugas

Menu:

Dashboard

Daftar Tugas

Navigasi

Riwayat

Pendapatan

Profil

Logout

---

# 15. Fitur Petugas

Melihat pelanggan.

Melihat lokasi pelanggan.

Navigasi Google Maps.

Upload foto sebelum dan sesudah.

Input berat sampah.

Update status.

Update lokasi realtime.

---

# 16. Dashboard Super Admin

Sidebar:

Dashboard

Petugas

Pelanggan

Pengambilan Sampah

Pembayaran

Penggajian

Tracking Petugas

Wilayah

Berita

Kegiatan

Slider

Profil

FAQ

CMS

Pengaturan Website

Laporan

Role Permission

Log Aktivitas

---

# 17. Dashboard

Menampilkan:

Jumlah pelanggan

Jumlah petugas

Permintaan hari ini

Pengambilan selesai

Pendapatan

Tagihan belum dibayar

Grafik

Map petugas realtime

---

# 18. Manajemen Petugas

Data:

Nama

NIK

No HP

Alamat

Foto

Status

Wilayah

Jadwal

Lokasi

Aktif/Tidak

---

# 19. Tracking Petugas

Menggunakan Google Maps.

Menampilkan:

Marker seluruh petugas.

Lokasi realtime.

Kecepatan.

Estimasi tiba.

Riwayat perjalanan.

Customer terakhir.

Customer berikutnya.

---

# 20. Penggajian Petugas

Data:

Gaji Pokok

Insentif

Bonus

Potongan

Jumlah Pengambilan

Total Berat

Lembur

Slip Gaji PDF

Status Pembayaran

---

# 21. Manajemen Pelanggan

Data:

Nama

Alamat

Nomor HP

Email

Koordinat

Jenis Langganan

Status

Tagihan

Jumlah Pengambilan

---

# 22. Monitoring Tagihan

Filter:

Belum Bayar

Lunas

Jatuh Tempo

Reminder WhatsApp

Reminder Email

---

# 23. Manajemen Pengambilan Sampah

Status:

Pending

Assigned

On Going

Completed

Canceled

Disertai:

Map

Timeline

Foto

Petugas

Pelanggan

---

# 24. CMS (Content Management System)

Modul:

Slider

Banner

Profil

Visi

Misi

Layanan

FAQ

Galeri

Berita

Agenda

Video

Mitra

Testimoni

Footer

Header Menu

Kontak

Media Sosial

SEO

---

# 25. Pengaturan Website

Logo

Favicon

Nama Website

Judul Website

Meta Title

Meta Description

Google Analytics

Google Maps API

SMTP

WhatsApp

Facebook

Instagram

TikTok

YouTube

Footer

Header

Copyright

---

# 26. Laporan

Laporan Pelanggan

Laporan Petugas

Laporan Pendapatan

Laporan Pengambilan

Laporan Pembayaran

Laporan Wilayah

Export:

Excel

PDF

Print

---

# 27. Notifikasi

Email

WhatsApp

Push Notification

SMS (Opsional)

---

# 28. API

REST API.

Authentication menggunakan Sanctum.

Semua endpoint menggunakan JSON.

---

# 29. Struktur Database

## Master

users

roles

permissions

provinces

cities

districts

villages

settings

sliders

news

activities

pages

menus

faqs

galleries

companies

partners

testimonials

---

## Operasional

customers

officers

pickup_requests

pickup_histories

payments

salary

attendance

gps_tracking

notifications

logs

---

# 30. Dashboard Analytics

Grafik pelanggan.

Grafik petugas.

Grafik pendapatan.

Grafik pembayaran.

Grafik wilayah.

Grafik pengambilan.

Heatmap pelanggan.

Live Map.

---

# 31. UI/UX

## Warna

Hijau (#16A34A)

Putih

Abu-abu terang

Biru (#2563EB)

Orange sebagai accent

---

## Konsep

Modern

Minimalis

Clean

Glassmorphism

Rounded Card

Responsive

Dark Mode Ready

---

# 32. Keamanan

CSRF

XSS Protection

SQL Injection Protection

Rate Limit

RBAC

Audit Log

2FA (Opsional)

Enkripsi Password (bcrypt/argon2)

---

# 33. Future Development

* Mobile Apps Android
* Mobile Apps iOS
* AI Optimasi Rute Pengambilan
* Prediksi Volume Sampah
* Integrasi Timbangan Digital
* IoT Smart Bin
* QR Code Pelanggan
* Sistem Reward & Poin
* Marketplace Daur Ulang
* Integrasi Bank Sampah
* Dashboard Pemerintah Daerah

---

# 34. Arsitektur Sistem

```text
                     React.js Frontend
                           │
                    REST API (Laravel)
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
 Authentication        Business Logic         CMS
      │                    │                    │
      └────────────────────┼────────────────────┘
                           │
                        MySQL Database
                           │
         Google Maps • Firebase • WhatsApp API
```

---

# 35. Roadmap Pengembangan

### Phase 1

* Landing Page
* Registrasi/Login
* Dashboard Pelanggan
* Dashboard Petugas
* Dashboard Admin

### Phase 2

* Tracking GPS Realtime
* Pembayaran Digital
* Penggajian
* Laporan
* CMS

### Phase 3

* Mobile Apps
* AI Route Optimization
* Smart Notification
* Integrasi Bank Sampah
* Analitik Lanjutan

---

# 36. Target Hasil

Sistem ini menjadi platform terpadu yang menghubungkan masyarakat, petugas pengangkut sampah, dan pengelola layanan dalam satu ekosistem digital. Dengan dukungan Laravel sebagai backend dan React.js sebagai frontend, aplikasi dirancang memiliki performa tinggi, antarmuka modern, serta skalabilitas yang baik. Fitur utama meliputi pemesanan pengambilan sampah, pelacakan petugas secara real-time berbasis peta, manajemen pelanggan, pembayaran, penggajian petugas, pelaporan, serta Content Management System (CMS) yang memungkinkan pengelolaan seluruh konten website tanpa memerlukan perubahan kode program.
