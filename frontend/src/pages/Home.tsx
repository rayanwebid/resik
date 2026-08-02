import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Leaf, Shield, Truck, ChevronRight,
    Award, Trash2, Activity, Sparkles, Globe
} from 'lucide-react';
import api from '../services/api';
import { useCompany } from '../contexts/CompanyContext';

const Home: React.FC = () => {
    const { company } = useCompany();
    const [data, setData] = useState<any>({
        sliders: [],
        company: null,
        testimonials: [],
        partners: [],
        latest_news: [],
        faqs: [],
        galleries: [],
    });

    // Eco Calculator States
    const [calcType, setCalcType] = useState<string>('plastik');
    const [calcWeight, setCalcWeight] = useState<number>(5);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const res = await api.get('/home-data');
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                console.error('Home data load error, using fallbacks', err);
            }
        };
        fetchHomeData();
    }, []);

    const fallbackTestimonials = [
        { name: 'Budi Santoso', rating: 5, comment: `Layanan ${company.name} sangat membantu! Jadwalnya teratur dan petugasnya ramah sekali.` },
        { name: 'Siti Aminah', rating: 5, comment: 'Sangat praktis bisa bayar iuran bulanan langsung lewat aplikasi. Sangat direkomendasikan!' },
        { name: 'Dewi Lestari', rating: 4, comment: 'Sistem jemput sampahnya tepat waktu. Saya tidak perlu pusing lagi memikirkan tumpukan sampah di rumah.' }
    ];

    const testimonials = data.testimonials.length > 0 ? data.testimonials : fallbackTestimonials;

    // Calculator values mapping
    const calcRates: Record<string, { name: string; price: number; co2: number; icon: any }> = {
        plastik: { name: 'Plastik (PET/HDPE)', price: 4500, co2: 1.2, icon: Trash2 },
        kertas: { name: 'Kertas & Karton', price: 2500, co2: 0.9, icon: Leaf },
        logam: { name: 'Besi / Aluminium', price: 9000, co2: 2.1, icon: Shield },
        organik: { name: 'Sampah Organik', price: 1500, co2: 0.5, icon: Globe },
    };

    const calculatedEarnings = calcWeight * calcRates[calcType].price;
    const calculatedCO2 = (calcWeight * calcRates[calcType].co2).toFixed(1);

    return (
        <div className="space-y-24 pb-24 bg-slate-50/50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 text-white min-h-[85vh] flex items-center pt-24 pb-16">
                {/* Abstract Glowing Background Orbs */}
                <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left space-y-6"
                        >
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/30 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 border border-emerald-400/30">
                                <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" /> #1 Layanan Pengangkutan Sampah Berbasis Digital
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
                                Lingkungan Bersih & Sehat <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-200">
                                    Tanpa Ribet, Sangat Praktis
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg text-emerald-50/90 leading-relaxed font-light">
                                {company.name} memudahkan warga mengelola sampah secara bersih, menjadwalkan penjemputan berkala komersial, memantau pergerakan armada secara real-time, dan membayar tagihan iuran pengangkutan bulanan dengan mudah.
                            </p>
                            <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4 pt-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 border border-transparent gap-2 duration-300 transform hover:-translate-y-0.5"
                                >
                                    Daftar Sekarang <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    to="/layanan"
                                    className="inline-flex items-center justify-center px-8 py-4 border border-emerald-400/50 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all gap-1.5 backdrop-blur-sm"
                                >
                                    Lihat Skema Biaya
                                </Link>
                            </div>
                        </motion.div>

                        {/* Floating Feature Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-16 lg:mt-0 lg:col-span-5 flex justify-center"
                        >
                            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl space-y-6">
                                <h3 className="text-lg font-bold text-emerald-100 flex items-center gap-2 border-b border-white/10 pb-3">
                                    <Activity className="h-5 w-5 text-amber-300" /> Ringkasan Aktivitas Terkini
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-lg">
                                                <Truck className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-emerald-200">Sedang Dijemput</p>
                                                <p className="text-sm font-semibold">Kecamatan Kebayoran Baru</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 bg-amber-400/30 text-amber-200 rounded-full font-medium">Aktif</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-400/20 text-emerald-300 rounded-lg">
                                                <Leaf className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-emerald-200">Total Daur Ulang</p>
                                                <p className="text-sm font-semibold">14,289 Kg Bulan Ini</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 bg-emerald-400/30 text-amber-200 rounded-full font-medium">+12%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Angled SVG wave separator */}
                <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 translate-y-[2px]">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] text-slate-50 fill-current">
                        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
                    </svg>
                </div>
            </section>

            {/* Impact stats counter */}
            <section className="-mt-16 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl p-6 sm:p-8 border border-slate-100">
                    <div className="text-center p-4 border-r border-slate-100 last:border-0">
                        <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">8.420+</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Warga Terdaftar</p>
                    </div>
                    <div className="text-center p-4 border-r border-slate-100 last:border-0">
                        <p className="text-3xl sm:text-4xl font-extrabold text-teal-600">25.6 Tons</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Sampah Terkelola</p>
                    </div>
                    <div className="text-center p-4 border-r border-slate-100 last:border-0">
                        <p className="text-3xl sm:text-4xl font-extrabold text-amber-600">98.5%</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">SLA Ketepatan Waktu</p>
                    </div>
                    <div className="text-center p-4 last:border-0">
                        <p className="text-3xl sm:text-4xl font-extrabold text-sky-600">30.7 Tons</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Emisi CO2 Ditekan</p>
                    </div>
                </div>
            </section>

            {/* Why section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full font-bold">Layanan Kami</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Ubah Kebiasaan Menjadi Kebaikan</h2>
                    <p className="text-slate-600 text-base">
                        Program {company.name} menyelaraskan kampanye kebersihan lingkungan dengan pengelolaan layanan pengangkutan sampah rumah tangga yang andal dan transparan.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <Leaf className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Layanan Pengangkutan Terjadwal</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Masyarakat diajak secara praktis menjadwalkan pengangkutan sampah medis, organik, maupun anorganik. Petugas kami akan melakukan pengambilan terjadwal tepat di depan rumah Anda.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Sistem Tagihan Transparan</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Nikmati kemudahan pelacakan pengangkutan dan pembayaran iuran bulanan yang transparan. Seluruh riwayat transaksi pengangkutan sampah tercatat rapi di dalam sistem.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 group">
                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                            <Award className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Ekonomi Sirkular Nyata</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Mendorong pengelolaan lingkungan yang sehat, meminimalkan tonase residu sampah ke TPA, serta mendukung proses daur ulang sampah yang efisien bersama mitra daur ulang lokal.
                        </p>
                    </div>
                </div>
            </section>

            {/* Interactive Eco Calculator */}
            <section className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
                        <div className="lg:col-span-6 space-y-6">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                                Eco Calculator
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Hitung Seberapa Besar <br />
                                <span className="text-amber-400">Kontribusi Lingkungan Anda</span>
                            </h2>
                            <p className="text-slate-300 leading-relaxed font-light">
                                Pilih kategori sampah dan input estimasi berat untuk mengetahui seberapa besar bonus rupiah yang dapat Anda peroleh dari daur ulang bernilai ekonomi sekaligus pengurangan jejak emisi karbon dioksida.
                            </p>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-slate-400 text-xs">Pohon Setara Diselamatkan</p>
                                    <p className="text-2xl font-bold mt-1 text-emerald-400">{(calcWeight * calcRates[calcType].co2 * 0.05).toFixed(2)} pohon</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-slate-400 text-xs">Air Bersih Dihemat</p>
                                    <p className="text-2xl font-bold mt-1 text-cyan-400">{(calcWeight * 2.5).toFixed(1)} Liter</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 lg:mt-0 lg:col-span-6">
                            <div className="bg-white text-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
                                <h3 className="text-xl font-bold text-slate-900">Perkiraan Nilai Konversi Sampah</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Pilih Jenis Sampah</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {Object.entries(calcRates).map(([key, item]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setCalcType(key)}
                                                    className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all ${calcType === key
                                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                                                        }`}
                                                >
                                                    {item.name.split(' ')[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase mb-2">
                                            <span>Estimasi Berat (Kg)</span>
                                            <span className="text-emerald-600 font-bold">{calcWeight} Kg</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={calcWeight}
                                            onChange={(e) => setCalcWeight(parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2">
                                        <span className="text-slate-500">Nilai Konversi</span>
                                        <span className="font-semibold text-slate-800">Rp {calcRates[calcType].price.toLocaleString('id-ID')} / Kg</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2">
                                        <span className="text-slate-500">Estimasi Nilai Ekonomi</span>
                                        <span className="font-bold text-amber-600 text-base">Rp {calculatedEarnings.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Reduksi Karbon (CO2)</span>
                                        <span className="font-bold text-emerald-600 text-base">{calculatedCO2} Kg CO2-eq</span>
                                    </div>
                                </div>

                                <div className="text-center pt-2">
                                    <Link
                                        to="/register"
                                        className="w-full inline-flex justify-center items-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-emerald-600/10 gap-1.5"
                                    >
                                        Mulai Ajukan Pengangkutan <ArrowRight className="h-4.5 w-4.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skema Implementasi */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full font-bold">Skema Kerja</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">4 Langkah Mudah</h2>
                    <p className="text-slate-600 text-base">
                        Bagaimana mengolah sampah rumah tangga Anda menjadi bersih melalui layanan pengangkutan kami.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { step: '01', title: 'Siapkan Sampah', desc: 'Kelompokkan sampah rumah tangga Anda sesuai dengan jenisnya.' },
                        { step: '02', title: 'Ajukan Request', desc: 'Gunakan tombol request pickup di aplikasi untuk memanggil petugas.' },
                        { step: '03', title: 'Penimbangan & Verifikasi', desc: 'Petugas melakukan pemindaian ke lokasi, melakukan timbangan presisi.' },
                        { step: '04', title: 'Pembayaran Bulanan', desc: 'Lakukan pembayaran tagihan pengantaran sampah rumah tangga Anda secara nontunai.' },
                    ].map((step, idx) => (
                        <div key={idx} className="relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                            <span className="absolute -top-6 left-6 text-5xl font-black text-slate-100 select-none">{step.step}</span>
                            <div className="pt-4 space-y-2">
                                <h4 className="font-bold text-lg text-slate-950">{step.title}</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Latest News Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div className="space-y-2">
                        <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full font-bold">Media & Edukasi</span>
                        <h2 className="text-3xl font-extrabold text-slate-900">Kabar Hijau Hari Ini</h2>
                    </div>
                    <Link to="/berita" className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors">
                        Lihat Seluruh Berita <ChevronRight className="h-4.5 w-4.5" />
                    </Link>
                </div>

                {data.latest_news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.latest_news.map((item: any) => (
                            <article key={item.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-300">
                                {item.image && (
                                    <div className="relative overflow-hidden group h-52">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-extrabold text-lg text-slate-900 hover:text-emerald-600 line-clamp-2">
                                            <Link to={`/berita/${item.slug}`}>{item.title}</Link>
                                        </h3>
                                        <p className="text-slate-500 text-xs line-clamp-3 mb-2 leading-relaxed">{item.summary}</p>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                        📅 {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-500 shadow-inner">
                        <Trash2 className="h-10 w-10 text-slate-350 mx-auto mb-3" />
                        <span className="text-sm">Belum ada berita yang diterbitkan saat ini.</span>
                    </div>
                )}
            </section>

            {/* Testimonials */}
            <section className="bg-gradient-to-tr from-slate-905 to-slate-950 text-white py-20 relative overflow-hidden bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Testimoni Warga</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold">Mereka yang Telah Bergabung</h2>
                        <p className="text-slate-400">Feedback tulus dari warga pelopor kebersihan yang menggunakan jasa pengumpulan sampah kami.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((test: any, idx: number) => (
                            <div key={idx} className="bg-slate-800/40 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all font-light">
                                <p className="text-slate-300 italic text-sm leading-relaxed mb-6">"{test.comment}"</p>
                                <div className="flex items-center gap-3 font-normal">
                                    <div className="h-10 w-10 bg-slate-700 text-emerald-400 font-bold rounded-full flex items-center justify-center">
                                        {test.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-emerald-300 text-sm">{test.name}</h4>
                                        <div className="flex gap-0.5 text-amber-400 text-xs mt-0.5">
                                            {Array.from({ length: test.rating || 5 }).map((_, i) => (
                                                <span key={i}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
