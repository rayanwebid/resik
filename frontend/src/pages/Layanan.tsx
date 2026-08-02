import React from 'react';
import { Truck, CreditCard, Shield, Settings2 } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';

const Layanan: React.FC = () => {
    const { company } = useCompany();

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                    Layanan Resmi <span className="text-emerald-600">{company.name}</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed font-normal">
                    Kami menyediakan berbagai fasilitas digital yang memudahkan pengelolaan sampah harian, baik untuk lingkungan pemukiman, pertokoan, maupun perkantoran.
                </p>
            </div>

            {/* Grid Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm flex gap-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl h-fit">
                        <Truck className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Request Penjemputan Sampah</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-normal">
                            Pengguna terdaftar dapat mengirimkan request penjemputan sampah kapan saja. Anda cukup menentukan tanggal, estimasi berat, catatan khusus, lokasi koordinat gps, serta foto pendukung. Admin akan mengarahkan petugas terdekat langsung ke depan rumah Anda.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm flex gap-6">
                    <div className="p-4 bg-sky-50 text-sky-600 rounded-xl h-fit">
                        <Shield className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Real-time GPS Tracking</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-normal">
                            Pantau lokasi armada penjemputan sampah agar Anda tidak melewatkan kedatangan petugas sampah. Fitur pemantauan GPS memberikan transparansi jalan sehingga estimasi waktu kedatangan petugas ke rumah Anda terpantau jelas.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm flex gap-6">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-xl h-fit">
                        <CreditCard className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Pembayaran Iuran Digital</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-normal">
                            Kami mendukung kemudahan pembayaran digital secara transparan. Tagihan iuran pengelolaan sampah bulanan Anda direkap dan ditampilkan rinci di dalam sistem. Anda dapat membayar melalui transfer bank, qris, maupun cash ke petugas sampah dengan validasi resmi.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm flex gap-6">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-xl h-fit">
                        <Settings2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Alokasi & Manajemen Petugas</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-normal">
                            Bagi admin kota atau supervisor wilayah, {company.name} mempermudah monitoring kerja petugas kebersihan kota. Alokasikan tugas penjemputan sampah berdasarkan zonasi wilayah kelurahan/kecamatan dengan pembagian beban kerja berimbang.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alur Section */}
            <div className="bg-slate-950 text-white rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/10 via-transparent to-transparent"></div>

                <div className="relative text-center max-w-2xl mx-auto mb-12 space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold">Bagaimana Cara Kerjanya?</h2>
                    <p className="text-slate-400 text-sm font-normal">Ikuti langkah sederhana ini untuk mulai memanfaatkan integrasi {company.name}.</p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-full font-bold text-emerald-400 text-lg">
                            1
                        </div>
                        <h4 className="font-bold text-base">Registrasi Akun</h4>
                        <p className="text-xs text-slate-400 font-normal leading-relaxed">Daftar sebagai pelanggan baru dengan mengisi rincian profil lengkap dan letak koordinat rumah.</p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-full font-bold text-emerald-400 text-lg">
                            2
                        </div>
                        <h4 className="font-bold text-base">Verifikasi Admin</h4>
                        <p className="text-xs text-slate-400 font-normal leading-relaxed">Admin akan memverifikasi alamat dan rincian administratif lainnya demi keamanan operasional.</p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-full font-bold text-emerald-400 text-lg">
                            3
                        </div>
                        <h4 className="font-bold text-base">Request Pengambilan</h4>
                        <p className="text-xs text-slate-400 font-normal leading-relaxed">Pesan jadwal penjemputan sampah. Anda bisa melacak keberangkatan petugas kebersihan.</p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-full font-bold text-emerald-400 text-lg">
                            4
                        </div>
                        <h4 className="font-bold text-base">Bayar Tagihan</h4>
                        <p className="text-xs text-slate-400 font-normal leading-relaxed">Lakukan pembayaran bulanan langsung lewat menu tagihan di dalam dashboard akun Anda.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layanan;
