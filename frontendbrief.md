# Frontend Brief.md

# Sistem Informasi Sampah (SI-SAMPAH)

Versi 1.0

Frontend Stack

* React.js
* Vite
* React Router DOM
* Tailwind CSS
* ShadCN UI
* Axios
* Framer Motion
* React Hook Form
* React Query / TanStack Query
* Leaflet / Google Maps
* Lucide React Icons

---

# Tujuan Frontend

Membangun website modern yang menjadi wajah utama perusahaan pengelola sampah sekaligus menyediakan portal digital bagi pelanggan untuk melakukan registrasi, login, pemesanan pengambilan sampah, pembayaran, dan pelacakan status layanan.

Desain harus mencerminkan:

* Modern
* Clean
* Professional
* Ramah lingkungan
* Mudah digunakan oleh semua kalangan
* Responsif di desktop, tablet, dan mobile

---

# Konsep UI

Style:

* Minimalis
* Glassmorphism ringan
* Rounded Card
* Soft Shadow
* Smooth Animation
* Full Responsive
* Loading Skeleton
* Dark Mode Ready

Inspirasi desain:

* Tesla
* Stripe
* Vercel
* Linear
* Notion
* Apple
* Grab
* Gojek

---

# Color Palette

Primary

Hijau
#16A34A

Secondary

Biru
#2563EB

Accent

Orange
#F97316

Background

#F8FAFC

Card

#FFFFFF

Text

#1E293B

Border

#E2E8F0

Danger

#DC2626

Success

#22C55E

Warning

#FACC15

---

# Typography

Heading

Poppins Bold

Body

Inter

Button

Inter SemiBold

---

# Border Radius

Card

20px

Button

14px

Input

12px

---

# Icon

Lucide React

---

# Layout

Navbar

Hero

Content

Footer

---

# Navbar

Logo kiri

Menu tengah

* Home
* Profil
* Layanan
* Berita
* Kegiatan
* FAQ
* Syarat Bergabung
* Kontak

Button kanan

Outline

Login

Primary Button

Daftar

Navbar bersifat sticky dengan efek blur saat halaman di-scroll.

---

# Hero Section

Full Width

Background berupa ilustrasi kota bersih dengan elemen daur ulang dan truk sampah modern.

Konten kiri:

Judul besar

"Hidup Bersih Dimulai dari Rumah Anda"

Subjudul

"Pesan layanan pengambilan sampah secara online dengan mudah, cepat, dan transparan."

CTA:

* Daftar Sekarang
* Pelajari Layanan

Konten kanan:

Ilustrasi atau animasi layanan pengangkutan sampah.

---

# Statistik

Empat kartu statistik:

* Jumlah Pelanggan
* Sampah Terangkut
* Petugas Aktif
* Wilayah Layanan

Animasi counter saat muncul di layar.

---

# Tentang Kami

Dua kolom:

Kiri

Foto perusahaan atau ilustrasi.

Kanan

Deskripsi singkat perusahaan, visi, misi, dan komitmen terhadap lingkungan.

---

# Cara Kerja

Empat langkah:

1. Daftar Akun
2. Ajukan Pengambilan
3. Petugas Datang
4. Sampah Terangkut

Setiap langkah menggunakan icon dan ilustrasi sederhana.

---

# Layanan

Grid 3–6 kartu layanan:

* Pengambilan Sampah Rumah Tangga
* Sampah Organik
* Sampah Anorganik
* Sampah Elektronik
* Sampah Daur Ulang
* Layanan Komersial

Setiap kartu berisi ikon, deskripsi singkat, dan tombol "Selengkapnya".

---

# Mengapa Memilih Kami

Grid keunggulan:

* Tepat Waktu
* Petugas Profesional
* Pelacakan Real-time
* Pembayaran Digital
* Ramah Lingkungan
* Dukungan Pelanggan

---

# Berita

Grid 3 berita terbaru:

* Gambar
* Judul
* Ringkasan
* Tanggal
* Tombol "Baca Selengkapnya"

---

# Kegiatan

Galeri kegiatan dalam bentuk masonry/grid dengan efek hover.

---

# Testimoni

Carousel berisi ulasan pelanggan.

Menampilkan:

* Foto
* Nama
* Rating
* Komentar

---

# FAQ

Accordion interaktif.

---

# CTA

Section penuh dengan latar hijau.

Judul:

"Siap Bergabung Menjadi Pelanggan?"

Tombol:

Daftar Sekarang

---

# Footer

Kolom 1

Logo

Profil singkat

Kolom 2

Menu Cepat

Kolom 3

Layanan

Kolom 4

Kontak

Alamat

Telepon

Email

Media Sosial

Bagian bawah:

Copyright.

---

# Halaman Profil

Banner

Profil perusahaan

Visi

Misi

Struktur Organisasi

Legalitas

Timeline perusahaan

---

# Halaman Berita

Filter kategori

Search

Pagination

Detail berita dengan breadcrumb.

---

# Halaman Kegiatan

Grid dokumentasi.

Filter berdasarkan tahun atau kategori.

---

# Halaman FAQ

Accordion dengan fitur pencarian.

---

# Halaman Syarat Bergabung

Menampilkan syarat administrasi, alur pendaftaran, manfaat bergabung, serta tombol menuju formulir registrasi.

---

# Halaman Login

Layout dua kolom.

Kiri

Ilustrasi.

Kanan

Form login.

Field:

* Email atau Nomor HP
* Password
* Remember Me

Tombol:

Masuk

Link:

* Lupa Password
* Daftar

Login menggunakan autentikasi API Laravel Sanctum.

---

# Halaman Registrasi

Multi-step form.

Tahap 1

Informasi pribadi.

Tahap 2

Alamat lengkap.

Tahap 3

Lokasi rumah menggunakan peta interaktif.

Tahap 4

Konfirmasi data.

Progress bar ditampilkan di bagian atas.

---

# Dashboard Pelanggan

Sidebar:

* Dashboard
* Profil
* Permintaan Pengambilan
* Riwayat Pengambilan
* Pembayaran
* Notifikasi
* Pengaturan
* Logout

Konten Dashboard:

* Ringkasan status layanan
* Tagihan berjalan
* Jadwal pengambilan berikutnya
* Riwayat aktivitas terbaru

---

# Halaman Permintaan Pengambilan

Form:

* Tanggal
* Jam
* Jenis Sampah
* Estimasi Berat
* Catatan
* Upload Foto
* Pilih Lokasi pada Peta

Tombol:

Kirim Permintaan

---

# Tracking Pengambilan

Timeline status:

Permintaan Dibuat → Diverifikasi → Petugas Ditugaskan → Dalam Perjalanan → Sampah Diambil → Selesai

Jika petugas sedang menuju lokasi, tampilkan posisi petugas pada peta secara real-time.

---

# Pembayaran

Daftar tagihan.

Status pembayaran dengan badge warna.

Metode pembayaran:

* Transfer Bank
* QRIS
* Virtual Account
* Tunai

Upload bukti pembayaran jika diperlukan.

---

# Profil Pengguna

Informasi akun.

Alamat.

Nomor HP.

Email.

Lokasi rumah.

Foto profil.

Ubah password.

---

# Komponen Global

* Button
* Input
* Textarea
* Select
* Date Picker
* Time Picker
* Modal
* Drawer
* Toast Notification
* Badge
* Avatar
* Table
* Pagination
* Card
* Tabs
* Breadcrumb
* Accordion
* Skeleton Loader
* Empty State
* Loading Spinner

---

# Responsif

Desktop:
≥1200px

Laptop:
992–1199px

Tablet:
768–991px

Mobile:
≤767px

Semua halaman harus mobile-first dan tetap nyaman digunakan pada berbagai ukuran layar.

---

# Animasi

Framer Motion digunakan untuk:

* Fade In
* Slide Up
* Card Hover
* Button Hover
* Counter Animation
* Page Transition
* Skeleton Loading
* Toast Notification

Animasi harus halus dan tidak berlebihan.

---

# Integrasi API

Semua data diambil dari REST API Laravel.

Endpoint utama meliputi:

* Authentication
* Profil Perusahaan
* Slider
* Berita
* Kegiatan
* FAQ
* Registrasi
* Login
* Dashboard Pelanggan
* Permintaan Pengambilan
* Tracking Petugas
* Pembayaran
* Notifikasi

Gunakan Axios dengan interceptor untuk penanganan token, refresh autentikasi, dan error global.

---

# Standar Pengembangan

* Gunakan TypeScript untuk meningkatkan keamanan tipe data.
* Pisahkan komponen menjadi reusable components.
* Terapkan lazy loading pada halaman.
* Gunakan code splitting untuk meningkatkan performa.
* Optimalkan gambar menggunakan format WebP.
* Terapkan SEO dasar pada halaman publik.
* Seluruh halaman harus memenuhi standar aksesibilitas (WCAG) dasar.

---

# Target Hasil

Frontend harus memberikan pengalaman pengguna yang cepat, modern, intuitif, dan profesional. Pengunjung dapat dengan mudah mengenal perusahaan, sedangkan pelanggan dapat melakukan seluruh proses layanan pengambilan sampah secara digital, mulai dari pendaftaran hingga pelacakan petugas dan pembayaran, melalui antarmuka yang responsif dan menarik.
