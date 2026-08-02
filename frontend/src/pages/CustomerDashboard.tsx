import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Truck, History, CreditCard, Navigation, LogOut,
    Clock, DollarSign, AlertCircle, CheckCircle2, Upload, Eye, FileText, MapPin
} from 'lucide-react';
import api from '../services/api';
import { useCompany } from '../contexts/CompanyContext';
import type { PickupRequest, Payment } from '../types';

const CustomerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { company } = useCompany();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'history' | 'billing'>('overview');
    const [data, setData] = useState<any>({
        summary: { total_pickups: 0, completed_pickups: 0, pending_pickups: 0, active_bill: 0 },
        latest_pickup: null,
        latest_bill: null
    });
    const [pickups, setPickups] = useState<PickupRequest[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    // Request Form State
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        waste_type: 'organik',
        estimated_weight: '1',
        notes: '',
        photo: '',
        latitude: '',
        longitude: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [wastePhotoPreview, setWastePhotoPreview] = useState<string | null>(null);

    // Billing Actions State
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('Transfer');
    const [proofUrl, setProofUrl] = useState('');
    const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
    const [payLoading, setPayLoading] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    // Selected Items for Details Modal
    const [selectedPickup, setSelectedPickup] = useState<any | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

    const fetchData = async () => {
        try {
            const resDash = await api.get('/customer/dashboard');
            if (resDash.data.success) {
                setData(resDash.data.data);
            }

            const resPickups = await api.get('/customer/pickup-requests');
            if (resPickups.data.success) {
                setPickups(resPickups.data.data);
            }

            const resPayments = await api.get('/customer/payments');
            if (resPayments.data.success) {
                setPayments(resPayments.data.data);
            }
        } catch (err) {
            console.error('Customer dashboard load error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: pos.coords.latitude.toFixed(8),
                        longitude: pos.coords.longitude.toFixed(8)
                    }));
                },
                (err) => {
                    console.error(err);
                    alert('Gagal mengambil koordinat GPS browser.');
                }
            );
        } else {
            alert('Browser tidak mendukung Geolocation.');
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(false);

        try {
            const res = await api.post('/customer/pickup-requests', {
                date: formData.date,
                time: formData.time,
                waste_type: formData.waste_type,
                estimated_weight: parseFloat(formData.estimated_weight),
                notes: formData.notes,
                photo: formData.photo || 'default_waste.png',
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            });

            if (res.data.success) {
                setFormSuccess(true);
                setWastePhotoPreview(null);
                setFormData({
                    date: '',
                    time: '',
                    waste_type: 'organik',
                    estimated_weight: '1',
                    notes: '',
                    photo: '',
                    latitude: '',
                    longitude: ''
                });
                fetchData();
            }
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Gagal mengirim penjemputan sampah.');
        } finally {
            setFormLoading(false);
        }
    };

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayment) return;
        setPayLoading(true);

        try {
            const res = await api.post(`/customer/payments/${selectedPayment.id}/pay`, {
                payment_method: paymentMethod,
                proof_path: proofUrl || 'proof_demo.png'
            });

            if (res.data.success) {
                setPaySuccess(true);
                setSelectedPayment(null);
                setProofUrl('');
                setProofPreviewUrl(null);
                fetchData();
                setTimeout(() => setPaySuccess(false), 4000);
            }
        } catch (err) {
            console.error(err);
            alert('Gagal mengunggah bukti pembayaran.');
        } finally {
            setPayLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-605"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-55 overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 bg-slate-900 text-white flex items-center justify-between px-4 py-3.5 shadow-md shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-emerald-600 rounded-lg">
                        <Truck className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="font-bold text-base tracking-wide">{company.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-300">{user?.name}</span>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded bg-slate-800 transition-colors"
                        title="Keluar"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between shrink-0">
                <div>
                    <div className="p-6 border-b border-slate-800 flex items-center space-x-2 text-white">
                        <div className="p-2 bg-emerald-600 rounded-lg">
                            <Truck className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-lg">{company.name}</span>
                    </div>

                    <nav className="p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <LayoutDashboard className="h-4.5 w-4.5" />
                            <span>Ringkasan</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('request')}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'request' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Truck className="h-4.5 w-4.5" />
                            <span>Jemput Sampah</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('history')}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <History className="h-4.5 w-4.5" />
                            <span>Riwayat</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <CreditCard className="h-4.5 w-4.5" />
                            <span>Tagihan & Iuran</span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800 mb-4">
                        <div className="h-9 w-9 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">Pelanggan</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        <span>Keluar Halaman</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (Floating App Bar Style) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around h-16 shadow-2xl px-2 pb-safe">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'overview' ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-[9.5px] mt-1">Ringkasan</span>
                </button>
                <button
                    onClick={() => setActiveTab('request')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'request' ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                >
                    <Truck className="h-5 w-5" />
                    <span className="text-[9.5px] mt-1">Jemput</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'history' ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                >
                    <History className="h-5 w-5" />
                    <span className="text-[9.5px] mt-1">Riwayat</span>
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'billing' ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-[9.5px] mt-1">Tagihan</span>
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 pb-24 md:pb-8">

                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Selamat datang kembali, {user?.name}!</h1>
                            <p className="text-sm text-gray-400 mt-1">Pantau status penjemputan sampah dan iuran bulanan Anda.</p>
                        </div>

                        {/* Counters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Request</p>
                                    <p className="text-2xl font-black text-gray-900 mt-2">{data.summary.total_pickups}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-650">
                                    <Truck className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Berhasil Diambil</p>
                                    <p className="text-2xl font-black text-gray-900 mt-2">{data.summary.completed_pickups}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-650">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Menunggu Antrian</p>
                                    <p className="text-2xl font-black text-gray-900 mt-2">{data.summary.pending_pickups}</p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-655">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tunggakan Iuran</p>
                                    <p className="text-2xl font-black text-gray-900 mt-2">Rp {parseInt(data.summary.active_bill).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl text-red-650">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Activity Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                                <h3 className="font-bold text-gray-900 text-lg">Pemesanan Penjemputan Terkini</h3>
                                {data.latest_pickup ? (
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Tgl & Jam Penjemputan:</span>
                                            <span className="font-bold text-gray-800">{data.latest_pickup.date} at {data.latest_pickup.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Tipe Kategori Sampah:</span>
                                            <span className="font-bold text-gray-800 capitalize">{data.latest_pickup.waste_type}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Status Pengiriman:</span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${data.latest_pickup.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {data.latest_pickup.status}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Belum ada request pengambilan terdaftar.</p>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                                <h3 className="font-bold text-gray-900 text-lg">Tagihan Iuran Terkini</h3>
                                {data.latest_bill ? (
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Periode Tagihan:</span>
                                            <span className="font-bold text-gray-800">Bulan {data.latest_bill.month} / {data.latest_bill.year}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Nominal Pembayaran:</span>
                                            <span className="font-bold text-gray-800">Rp {parseInt(data.latest_bill.amount).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Status Pembayaran:</span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${data.latest_bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {data.latest_bill.status}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Belum ada tagihan iuran langganan bulanan saat ini.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Request Form */}
                {activeTab === 'request' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-sm max-w-2xl mx-auto space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Request Penjemputan Sampah Baru</h2>
                            <p className="text-xs text-gray-400 mt-1">Silakan tentukan jadwal dan estimasi volume sampah untuk memanggil petugas.</p>
                        </div>

                        {formSuccess && (
                            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex gap-2 border border-emerald-100">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>Permintaan berhasil dikirim. Petugas kebersihan akan segera ditugaskan ke alamat Anda.</span>
                            </div>
                        )}

                        {formError && (
                            <div className="p-4 bg-red-50 text-red-800 text-xs rounded-xl flex gap-2 border border-red-100">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tanggal Penjemputan</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Estimasi Jam Datang</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="Contoh: 09:00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipe Sampah</label>
                                    <select
                                        value={formData.waste_type}
                                        onChange={e => setFormData({ ...formData, waste_type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                        required
                                    >
                                        <option value="organik">Organik (Basah/Dedaunan)</option>
                                        <option value="anorganik">Anorganik (Plastik/Kertas)</option>
                                        <option value="campuran">Campuran (Seluruh Tipe)</option>
                                        <option value="b3">B3 (Bahan Beracun/Elektronik)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Estimasi Berat (Kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={formData.estimated_weight}
                                        onChange={e => setFormData({ ...formData, estimated_weight: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Catatan Khusus Kebutuhan</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    placeholder="Contoh: letakkan sampah di wadah hitam depan pagar..."
                                ></textarea>
                            </div>

                            {/* Dropzone Foto Sampah */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Foto Kondisi Sampah (Opsional)</label>
                                {wastePhotoPreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50 flex items-center justify-center group">
                                        <img src={wastePhotoPreview} alt="Preview Sampah" className="object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setWastePhotoPreview(null);
                                                    setFormData(prev => ({ ...prev, photo: '' }));
                                                }}
                                                className="px-3 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Hapus Foto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-emerald-50/5">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setWastePhotoPreview(reader.result as string);
                                                        setFormData(prev => ({ ...prev, photo: file.name }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="waste-photo-input"
                                        />
                                        <label htmlFor="waste-photo-input" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="h-7 w-7 text-slate-400 mb-2" />
                                            <span className="text-sm font-bold text-slate-700">Pilih atau Seret Foto Sampah</span>
                                            <span className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG (Maks. 2MB)</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Latitude Lokasi</label>
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-slate-50"
                                        placeholder="-6.123456"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Longitude Lokasi</label>
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-slate-50"
                                        placeholder="107.123456"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    className="inline-flex items-center gap-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-medium"
                                >
                                    <Navigation className="h-4 w-4" /> Gunakan Kordinat GPS Rumah
                                </button>
                            </div>

                            {/* GPS Map Preview Card */}
                            {formData.latitude && formData.longitude && (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
                                    <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-emerald-800">GPS Terkoneksi & Presisi</p>
                                        <p className="text-[11px] text-emerald-600 mt-0.5">
                                            Koordinat: <span className="font-mono">{formData.latitude}, {formData.longitude}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Lokasi penjemputan sampah otomatis diarahkan ke titik koordinat rumah Anda.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white rounded-lg font-medium transition-colors text-sm"
                            >
                                {formLoading ? 'Mengirim...' : 'Kirim Pengajuan Jemput Sampah'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab 3: Riwayat */}
                {activeTab === 'history' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Riwayat Pengambilan Sampah</h2>
                            <p className="text-sm text-gray-400 mt-1">Daftar seluruh request penjemputan sampah ke alamat rumah Anda.</p>
                        </div>

                        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-gray-150">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori Sampah</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estimasi Berat</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Petugas Lapangan</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-700">
                                    {pickups.length > 0 ? (
                                        pickups.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-950">{p.date} at {p.time}</td>
                                                <td className="px-6 py-4 whitespace-nowrap capitalize">{p.waste_type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{p.estimated_weight} Kg</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.officer?.name || <span className="italic text-gray-400">Belum didistribusikan</span>}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${p.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' : p.status === 'batal' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => setSelectedPickup(p)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Belum ada pemesanan penjemputan sampah terdaftar.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 4: Billing & Payments */}
                {activeTab === 'billing' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Tagihan Iuran Langganan</h2>
                            <p className="text-sm text-gray-400 mt-1">Daftar biaya bulanan pengelolaan sampah pemukiman Anda.</p>
                        </div>

                        {paySuccess && (
                            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex gap-2 border border-emerald-100">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>Bukti pembayaran berhasil diunggah. Hubungi admin untuk mempercepat konfirmasi verifikasi loket pembayaran.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Table */}
                            <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm h-fit">
                                <table className="min-w-full divide-y divide-gray-150">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periode Bulan</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tagihan (Rp)</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-700">
                                        {payments.length > 0 ? (
                                            payments.map(pay => (
                                                <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-950">Bulan {pay.month} / {pay.year}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">Rp {parseInt(pay.amount as any).toLocaleString('id-ID')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${pay.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : pay.status === 'Pending' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-800'}`}>
                                                            {pay.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => setSelectedInvoice(pay)}
                                                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-205 text-slate-750 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                                            >
                                                                <FileText className="h-3.5 w-3.5" />
                                                                Rincian
                                                            </button>
                                                            {(pay.status === 'Unpaid' || pay.status === 'Jatuh Tempo') && (
                                                                <button
                                                                    onClick={() => setSelectedPayment(pay)}
                                                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                                                                >
                                                                    Bayar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Belum ada daftar tagihan iuran langganan saat ini.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Upload Proof Sidebar Form */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm h-fit space-y-4">
                                <h3 className="font-bold text-gray-900 text-base">Loket Bayar & Upload Bukti</h3>
                                {selectedPayment ? (
                                    <form onSubmit={handlePaySubmit} className="space-y-4">
                                        <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5">
                                            <p className="text-gray-450 uppercase font-semibold">Tabel Tagihan Dipilih:</p>
                                            <p className="font-bold text-gray-800 text-sm">Bulan {selectedPayment.month} / {selectedPayment.year}</p>
                                            <p className="font-black text-gray-950 text-base">Rp {parseInt(selectedPayment.amount as any).toLocaleString('id-ID')}</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Metode Transfer</label>
                                            <select
                                                value={paymentMethod}
                                                onChange={e => setPaymentMethod(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                                            >
                                                <option value="Transfer">Transfer Bank Mandiri/BCA</option>
                                                <option value="QRIS">Doku/QRIS Online</option>
                                                <option value="Virtual Account">Briva/Virtual Account</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unggah Bukti Transfer</label>
                                            {proofPreviewUrl ? (
                                                <div className="relative rounded-xl overflow-hidden border border-slate-205 aspect-video bg-slate-50 flex items-center justify-center group">
                                                    <img src={proofPreviewUrl} alt="Bukti Transfer" className="object-contain w-full h-full p-1" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setProofPreviewUrl(null);
                                                                setProofUrl('');
                                                            }}
                                                            className="px-2.5 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Hapus Berkas
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition-colors hover:bg-emerald-50/5">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setProofPreviewUrl(reader.result as string);
                                                                    setProofUrl(file.name);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        className="hidden"
                                                        id="proof-photo-input"
                                                    />
                                                    <label htmlFor="proof-photo-input" className="cursor-pointer flex flex-col items-center">
                                                        <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                                                        <span className="text-xs font-bold text-slate-700">Pilih / Seret Foto Struk</span>
                                                        <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 2MB</span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={payLoading}
                                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                            >
                                                {payLoading ? 'Mengirim...' : 'Kirim Pembayaran'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPayment(null)}
                                                className="px-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <p className="text-xs text-gray-400 italic font-normal leading-relaxed">
                                        Silakan pilih salah satu periode tagihan "Unpaid" di tabel sebelah kiri lalu klik tombol "Konfirmasi Bayar" untuk mengunggah berkas bukti transaksi pembayaran.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Detail Penjemputan */}
            {selectedPickup && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 transition-all duration-300">
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Truck className="h-5 w-5 text-emerald-600" />
                                Rincian Penjemputan Sampah
                            </h3>
                            <button
                                onClick={() => setSelectedPickup(null)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Status */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status Sekarang</p>
                                <span className={`inline-block px-3 py-1 font-bold text-xs uppercase rounded-full ${selectedPickup.status === 'selesai' ? 'bg-emerald-100 text-emerald-800'
                                    : selectedPickup.status === 'batal' ? 'bg-red-100 text-red-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                    {selectedPickup.status}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</p>
                                    <p className="font-medium text-slate-700 mt-0.5">{selectedPickup.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Penjemputan</p>
                                    <p className="font-medium text-slate-700 mt-0.5">{selectedPickup.time} WIB</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jenis Sampah</p>
                                    <p className="font-medium text-slate-700 capitalize mt-0.5">{selectedPickup.waste_type}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimasi Berat</p>
                                    <p className="font-medium text-slate-700 mt-0.5">{selectedPickup.estimated_weight} Kg</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catatan Tambahan</p>
                                    <p className="font-medium text-slate-700 mt-0.5">{selectedPickup.notes || '-'}</p>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Officer Profile */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Petugas Kebersihan</p>
                                {selectedPickup.officer ? (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-805 text-sm">
                                            {selectedPickup.officer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{selectedPickup.officer.name}</p>
                                            <p className="text-xs text-slate-400">Hubungi: {selectedPickup.officer.phone ?? '-'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Petugas belum ditugaskan oleh admin.</p>
                                )}
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedPickup(null)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Tagihan (Invoice Breakdown) */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 transition-all duration-300">
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-emerald-600" />
                                Rincian Invoice Iuran
                            </h3>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Invoice Header */}
                            <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Periode Tagihan</p>
                                <p className="font-bold text-slate-800 text-base mt-0.5">Bulan {selectedInvoice.month} / {selectedInvoice.year}</p>
                                <p className="text-3xl font-black text-rose-600 mt-2">
                                    Rp {Number(selectedInvoice.amount).toLocaleString('id-ID')}
                                </p>
                                <span className={`inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800'
                                    : selectedInvoice.status === 'Pending' ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {selectedInvoice.status === 'Paid' ? 'Lunas'
                                        : selectedInvoice.status === 'Pending' ? 'Menunggu Konfirmasi'
                                            : 'Belum Dibayar'}
                                </span>
                            </div>

                            {/* Detailed Bill Breakdown */}
                            <div className="space-y-2 text-sm">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rincian Pembayaran</p>
                                <div className="flex justify-between py-1 border-b border-dashed border-slate-100 text-slate-600">
                                    <span>Biaya Pokok Langganan</span>
                                    <span className="font-semibold text-slate-800">Rp {Number(selectedInvoice.amount - 2000).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed border-slate-100 text-slate-600">
                                    <span>Biaya Administrasi Loket</span>
                                    <span className="font-semibold text-slate-800">Rp 2.000</span>
                                </div>
                                <div className="flex justify-between py-1 text-slate-800 font-bold">
                                    <span>Total Tagihan</span>
                                    <span>Rp {Number(selectedInvoice.amount).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Instructions Box */}
                            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2.5 text-xs text-slate-600">
                                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                    Petunjuk Transfer Pembayaran
                                </p>
                                <p className="leading-relaxed">
                                    Silakan transfer nominal tagihan persis ke rekening loket penjemputan sampah berikut:
                                </p>
                                <div className="bg-white p-2.5 rounded-lg border border-slate-150 font-mono text-slate-800 space-y-1">
                                    <p><span className="font-bold text-slate-500">Bank BCA:</span> 8831002244</p>
                                    <p><span className="font-bold text-slate-500">Bank Mandiri:</span> 132-00-552211-9</p>
                                    <p><span className="font-bold text-slate-500">A.N:</span> {company.name} Cleaners</p>
                                </div>
                                <p className="text-[10px] text-slate-400 italic">
                                    Setelah transfer, harap melampirkan foto struk bukti transfer di form pembayaran.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                            >
                                Tutup
                            </button>
                            {(selectedInvoice.status === 'Unpaid' || selectedInvoice.status === 'Jatuh Tempo') && (
                                <button
                                    onClick={() => {
                                        setSelectedPayment(selectedInvoice);
                                        setSelectedInvoice(null);
                                        setActiveTab('billing');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                                >
                                    Bayar Sekarang
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
