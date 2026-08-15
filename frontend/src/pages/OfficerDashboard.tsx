import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Truck, CheckCircle2, Navigation, LogOut,
    Clock, MapPin, Upload, CheckSquare, Compass, Eye, X,
    Trash2, Camera, Phone, Check, Activity, Shield
} from 'lucide-react';
import api, { getApiBaseUrl } from '../services/api';
import { useCompany } from '../contexts/CompanyContext';
import type { PickupRequest } from '../types';
import SEO from '../components/SEO';

const OfficerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { company } = useCompany();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'gps'>('overview');
    const [summary, setSummary] = useState({ total_tasks: 0, completed_tasks: 0, active_tasks: 0 });
    const [tasks, setTasks] = useState<PickupRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // GPS Simulation states
    const [gpsData, setGpsData] = useState({ latitude: '-8.366022', longitude: '114.165939' });
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsSuccess, setGpsSuccess] = useState(false);
    const [simulatedLogs, setSimulatedLogs] = useState<Array<{ time: string, lat: string, lng: string }>>([
        { time: '18:55', lat: '-8.366010', lng: '114.165920' },
        { time: '18:58', lat: '-8.366022', lng: '114.165939' }
    ]);

    // Task Completion states
    const [selectedTask, setSelectedTask] = useState<PickupRequest | null>(null);
    const [completionData, setCompletionData] = useState({
        weight: '5.0',
        cost: '25000'
    });
    const [completionPhoto, setCompletionPhoto] = useState<File | null>(null);
    const [completionPhotoPreview, setCompletionPhotoPreview] = useState<string | null>(null);
    const [completeLoading, setCompleteLoading] = useState(false);

    // Detail Modal states
    const [detailTask, setDetailTask] = useState<PickupRequest | null>(null);

    const fetchData = async () => {
        try {
            const resDash = await api.get('/officer/dashboard');
            if (resDash.data.success) {
                const s = resDash.data.data.summary;
                setSummary({
                    total_tasks: s.total_tasks || 0,
                    completed_tasks: s.completed_tasks || 0,
                    active_tasks: s.active_tasks || 0
                });
                const off = resDash.data.data.officer;
                if (off && off.latitude && off.longitude) {
                    setGpsData({
                        latitude: String(off.latitude),
                        longitude: String(off.longitude)
                    });
                }
            }

            const resTasks = await api.get('/officer/tasks');
            if (resTasks.data.success) {
                setTasks(resTasks.data.data);
            }
        } catch (err) {
            console.error('Officer dashboard load error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (taskId: number, newStatus: string) => {
        try {
            const res = await api.patch(`/officer/tasks/${taskId}/status`, { status: newStatus });
            if (res.data.success) {
                alert(`Status diubah menjadi: ${newStatus}`);
                fetchData();
                if (detailTask && detailTask.id === taskId) {
                    setDetailTask({ ...detailTask, status: newStatus as any });
                }
            }
        } catch (err) {
            console.error(err);
            alert('Gagal memperbaharui status.');
        }
    };

    const handleCompleteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;
        setCompleteLoading(true);

        try {
            const photoName = completionPhoto ? completionPhoto.name : 'completed_pickup.png';
            const res = await api.post(`/officer/tasks/${selectedTask.id}/complete`, {
                weight: parseFloat(completionData.weight),
                cost: parseInt(completionData.cost),
                photo_after: photoName
            });

            if (res.data.success) {
                alert('Tugas dinyatakan selesai dan nota tagihan berhasil diterbitkan.');
                setSelectedTask(null);
                setCompletionPhoto(null);
                setCompletionPhotoPreview(null);
                setCompletionData({ weight: '5.0', cost: '25000' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menyelesaikan penjemputan sampah.');
        } finally {
            setCompleteLoading(false);
        }
    };

    const handleGpsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGpsLoading(true);
        setGpsSuccess(false);

        try {
            const res = await api.post('/officer/gps', {
                latitude: parseFloat(gpsData.latitude),
                longitude: parseFloat(gpsData.longitude)
            });
            if (res.data.success) {
                setGpsSuccess(true);
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                setSimulatedLogs(prev => [
                    { time: timeStr, lat: gpsData.latitude, lng: gpsData.longitude },
                    ...prev.slice(0, 4)
                ]);
                setTimeout(() => setGpsSuccess(false), 3000);
            }
        } catch (err) {
            console.error(err);
            alert('Gagal merekam simulasi GPS petugas.');
        } finally {
            setGpsLoading(false);
        }
    };

    const autofillGpsCoord = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setGpsData({
                        latitude: pos.coords.latitude.toFixed(8),
                        longitude: pos.coords.longitude.toFixed(8)
                    });
                },
                () => alert('Gagal mendeteksi lokasi pinout GPS.')
            );
        } else {
            alert('Geolocation tidak didukung oleh browser ini.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600"></div>
            </div>
        );
    }

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            menunggu: 'bg-amber-100 text-amber-800 border-amber-200',
            diproses: 'bg-blue-105 text-blue-700 border-blue-200',
            'dalam perjalanan': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'sudah diambil': 'bg-purple-100 text-purple-700 border-purple-200',
            selesai: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            batal: 'bg-red-100 text-red-700 border-red-200',
        };
        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${map[status] ?? 'bg-slate-100 text-slate-700'}`;
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
            <SEO title="Dasbor Petugas" description="Dasbor petugas ResikApp." />
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-50 bg-slate-900 text-white flex items-center justify-between px-4 py-3.5 shadow-md shrink-0">
                <div className="flex items-center space-x-2">
                    {company.logo ? (
                        <img src={company.logo.startsWith('http') ? company.logo : `${getApiBaseUrl()}${company.logo}`} alt="Logo" className="h-7 w-auto max-w-[3.5rem] object-contain rounded-lg bg-white p-0.5" />
                    ) : (
                        <div className="p-1.5 bg-emerald-600 rounded-lg">
                            <Truck className="h-4 w-4 text-white" />
                        </div>
                    )}
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
                        {company.logo ? (
                            <img src={company.logo.startsWith('http') ? company.logo : `${getApiBaseUrl()}${company.logo}`} alt="Logo" className="h-8 w-auto max-w-[4rem] object-contain rounded-lg bg-white p-1" />
                        ) : (
                            <div className="p-2 bg-emerald-600 rounded-lg">
                                <Truck className="h-5 w-5" />
                            </div>
                        )}
                        <span className="font-bold text-lg">{company.name}</span>
                    </div>

                    <nav className="p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <LayoutDashboard className="h-4.5 w-4.5" />
                            <span>Ringkasan Tugas</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tasks' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Truck className="h-4.5 w-4.5" />
                            <span>Daftar Order</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('gps')}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'gps' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Compass className="h-4.5 w-4.5" />
                            <span>Kirim Koordinat GPS</span>
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
                            <p className="text-xs text-slate-500 truncate">Petugas Lapangan</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        <span>Keluar Halaman</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-around h-16 shadow-2xl px-2 pb-safe">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'overview' ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-[9.5px] mt-1">Ringkasan</span>
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'tasks' ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                >
                    <Truck className="h-5 w-5" />
                    <span className="text-[9.5px] mt-1">Daftar Order</span>
                </button>
                <button
                    onClick={() => setActiveTab('gps')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === 'gps' ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                >
                    <Compass className="h-5 w-5" />
                    <span className="text-[9.5px] mt-1">Kirim GPS</span>
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 pb-24 md:pb-8">

                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard Petugas Lapangan</h1>
                            <p className="text-sm text-gray-400 mt-1">Kelola rincian penugasan pickup sampah harian Anda di sini.</p>
                        </div>

                        {/* Counters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Antrian Aktif</p>
                                    <p className="text-3xl font-black text-gray-900 mt-2">{summary.active_tasks}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Selesai Dikerjakan</p>
                                    <p className="text-3xl font-black text-gray-900 mt-2">{summary.completed_tasks}</p>
                                </div>
                                <div className="p-3 bg-emerald-52 rounded-xl text-emerald-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Penugasan</p>
                                    <p className="text-3xl font-black text-gray-900 mt-2">{summary.total_tasks}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                                    <Truck className="h-6 w-6" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-150 p-6 rounded-2xl max-w-4xl space-y-2">
                            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                                <Activity className="h-4.5 w-4.5 text-emerald-600 animate-pulse" /> Kiat Layanan Pengantaran Lapangan
                            </h3>
                            <p className="text-xs text-emerald-800 leading-relaxed font-normal">
                                Pastikan Anda menekan tombol "Kirim Koordinat GPS" paling tidak satu kali saat melakukan perjalanan pickup sampah. Ini memungkinkan warga melacak pergerakan truk pengangkut Anda dari dashboard mereka secara real-time.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tab 2: Tasks List */}
                {activeTab === 'tasks' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Daftar Order Penjemputan Sampah</h2>
                            <p className="text-sm text-gray-400 mt-1">Daftar lokasi dan status order yang didistribusikan ke beban kerja Anda.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Tasks table */}
                            <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm h-fit">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] divide-y divide-gray-150">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pelanggan & Alamat</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal & Berat</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tindakan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-700">
                                        {tasks.length > 0 ? (
                                            tasks.map(t => (
                                                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-950 text-xs flex items-center gap-1.5">
                                                            {t.customer?.name}
                                                            <button
                                                                onClick={() => setDetailTask(t)}
                                                                className="text-emerald-650 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors"
                                                                title="Lihat Detail Pelanggan"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="text-slate-450 text-[11px] truncate max-w-[200px]" title={t.customer?.address}>
                                                            {t.customer?.address}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                        <div className="font-semibold text-gray-800">{t.date} at {t.time}</div>
                                                        <div className="text-slate-450 font-medium">Estimasi: {t.estimated_weight} Kg</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={statusBadge(t.status)}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {t.status !== 'selesai' && t.status !== 'batal' ? (
                                                            <div className="flex flex-col gap-1.5 max-w-[140px]">
                                                                <select
                                                                    value={t.status}
                                                                    onChange={e => handleUpdateStatus(t.id, e.target.value)}
                                                                    className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-750 font-medium focus:outline-none focus:border-emerald-500"
                                                                >
                                                                    <option value="menunggu">Menunggu</option>
                                                                    <option value="diproses">Dalam Proses</option>
                                                                    <option value="dalam perjalanan">Dalam Perjalanan</option>
                                                                    <option value="sudah diambil">Sudah Diambil</option>
                                                                </select>
                                                                <button
                                                                    onClick={() => setSelectedTask(t)}
                                                                    className="w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold transition-all text-center flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                                                >
                                                                    <CheckSquare className="h-3.5 w-3.5" /> Input Selesai
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-slate-400 text-xs italic">
                                                                <Check className="h-4 w-4 text-emerald-650" /> Selesai
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">Belum ada daftar order penjemputan sampah terdistribusi.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                </div>
                            </div>

                            {/* Input Complete Form */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm h-fit space-y-4">
                                <h3 className="font-bold text-gray-900 text-base">Zonasi Berat Final & Biaya</h3>
                                {selectedTask ? (
                                    <form onSubmit={handleCompleteSubmit} className="space-y-4">
                                        <div className="p-3.5 bg-slate-55 rounded-xl text-xs space-y-1.5 border border-slate-100">
                                            <p className="text-gray-400 uppercase font-bold text-[10px] tracking-wider">Tugas Pelanggan:</p>
                                            <p className="font-bold text-slate-800">{selectedTask.customer?.name}</p>
                                            <p className="text-slate-500 leading-normal">{selectedTask.customer?.address}</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Berat Final Sebenarnya (Kg)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={completionData.weight}
                                                onChange={e => setCompletionData({ ...completionData, weight: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Biaya Tagihan Penanganan (Rp)</label>
                                            <input
                                                type="number"
                                                value={completionData.cost}
                                                onChange={e => setCompletionData({ ...completionData, cost: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Foto Bukti Setelah Diangkut</label>
                                            {!completionPhotoPreview ? (
                                                <div
                                                    onDragOver={e => e.preventDefault()}
                                                    onDrop={e => {
                                                        e.preventDefault();
                                                        const file = e.dataTransfer.files?.[0];
                                                        if (file) {
                                                            setCompletionPhoto(file);
                                                            setCompletionPhotoPreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = 'image/*';
                                                        input.onchange = e => {
                                                            const file = (e.target as HTMLInputElement).files?.[0];
                                                            if (file) {
                                                                setCompletionPhoto(file);
                                                                setCompletionPhotoPreview(URL.createObjectURL(file));
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                >
                                                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2 animate-bounce" />
                                                    <span className="text-xs text-gray-400 font-bold block">Tarik & Lepas Foto Di Sini</span>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">atau klik untuk menelusuri</span>
                                                </div>
                                            ) : (
                                                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-slate-50">
                                                    <img src={completionPhotoPreview} className="w-full h-32 object-cover" alt="Trash clean proof" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCompletionPhoto(null);
                                                            setCompletionPhotoPreview(null);
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                                        <span className="truncate max-w-[150px]">{completionPhoto?.name || 'custom_photo.png'}</span>
                                                        <span>{completionPhoto ? ((completionPhoto.size) / 1024 / 1024).toFixed(2) + ' MB' : 'Simulasi'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={completeLoading}
                                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                                            >
                                                {completeLoading ? 'Menyimpan...' : 'Secara Resmi Selesai'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTask(null);
                                                    setCompletionPhoto(null);
                                                    setCompletionPhotoPreview(null);
                                                }}
                                                className="px-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <p className="text-xs text-gray-400 italic font-normal leading-relaxed">
                                        Silakan pilih salah satu daftar tugas bermasalah di sebelah kiri, lakukan jemput sampah, lalu klik tombol "Input Selesai" untuk memasukkan berat timbangan riil dan mencetak struk tagihan iuran.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 3: GPS Simulation */}
                {activeTab === 'gps' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-sm space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Navigation className="h-6 w-6 text-emerald-600 animate-pulse" /> Kirim Koordinat GPS Keberadaan
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">Simulasikan rute armada truk Anda di peta agar warga dapat bersiap mengeluarkan keranjang sampah.</p>
                            </div>

                            {gpsSuccess && (
                                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex gap-2 border border-emerald-100">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>Titik GPS armada pengangkut berhasil dikirim ke server.</span>
                                </div>
                            )}

                            <form onSubmit={handleGpsSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Latitude Lokasi Petugas</label>
                                        <input
                                            type="text"
                                            value={gpsData.latitude}
                                            onChange={e => setGpsData({ ...gpsData, latitude: e.target.value })}
                                            placeholder="Contoh: -6.123456"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Longitude Lokasi Petugas</label>
                                        <input
                                            type="text"
                                            value={gpsData.longitude}
                                            onChange={e => setGpsData({ ...gpsData, longitude: e.target.value })}
                                            placeholder="Contoh: 107.123456"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={autofillGpsCoord}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                        <MapPin className="h-4 w-4" /> Deteksi GPS Otomatis
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={gpsLoading}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-450 text-white rounded-lg font-bold transition-colors text-sm shadow-sm cursor-pointer"
                                >
                                    {gpsLoading ? 'Mengirim data koordinat...' : 'Sync GPS Sekarang'}
                                </button>
                            </form>
                        </div>

                        {/* GPS Radar / Simulator Compass Card */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                    <Activity className="h-4.5 w-4.5 text-emerald-650 animate-pulse" /> Live Tracker Monitoring
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Umpan langsung satelit simulasi pergerakan armada petugas sampah.</p>
                            </div>

                            {/* Radar Visualization */}
                            <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-slate-950 rounded-full border-4 border-slate-900 overflow-hidden shadow-inner">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)]"></div>
                                <div className="absolute w-full h-[1px] bg-emerald-500/20 top-1/2"></div>
                                <div className="absolute h-full w-[1px] bg-emerald-500/20 left-1/2"></div>
                                {/* Scanning Sweep */}
                                <div className="absolute w-24 h-24 bg-gradient-to-tr from-emerald-500/0 to-emerald-500/25 rounded-bl-full origin-bottom-right bottom-1/2 right-1/2 animate-spin duration-3000"></div>

                                {/* Blip */}
                                <div className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white animate-ping"></div>
                                <div className="absolute w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white"></div>

                                <span className="absolute bottom-2 text-[9px] font-mono text-emerald-400 tracking-wider">RADAR ACTIVE</span>
                            </div>

                            {/* Simulated Logs */}
                            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-700">Log Aktivitas GPS Terbaru</div>
                                <div className="divide-y divide-slate-100 font-mono text-[10.5px]">
                                    {simulatedLogs.map((log, idx) => (
                                        <div key={idx} className="flex justify-between items-center px-4 py-2 text-slate-600">
                                            <span className="flex items-center gap-1 text-emerald-650 font-bold">
                                                <Compass className="h-3 w-3 animate-spin duration-1000" /> {log.time}
                                            </span>
                                            <span>Lat: {log.lat}, Lng: {log.lng}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Task Detail Modal */}
            {detailTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-150">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-emerald-650 animate-bounce" /> Rincian Order Penjemputan
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">ID Order: #{detailTask.id}</p>
                            </div>
                            <button
                                onClick={() => setDetailTask(null)}
                                className="p-2 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Section: Waste details */}
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Informasi Sampah</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-slate-400">Jenis Sampah</p>
                                                <p className="font-bold text-slate-800 uppercase mt-0.5">{detailTask.waste_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Estimasi Berat</p>
                                                <p className="font-bold text-slate-800 mt-0.5">{detailTask.estimated_weight} Kg</p>
                                            </div>
                                            <div className="col-span-2 pt-2 border-t border-slate-200/50">
                                                <p className="text-slate-400">Catatan Warga</p>
                                                <p className="text-slate-700 italic mt-0.5 leading-relaxed">
                                                    {detailTask.notes || 'Tidak ada catatan khusus.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Waste Photo Preview */}
                                    <div className="space-y-2">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Foto Sampah yang Dilaporkan</span>
                                        <div className="relative rounded-2xl overflow-hidden border border-gray-150 h-40 bg-gray-50 flex items-center justify-center">
                                            {detailTask.photo ? (
                                                <img
                                                    src={
                                                        detailTask.photo.startsWith('http') || detailTask.photo.startsWith('data:')
                                                            ? detailTask.photo
                                                            : `/storage/${detailTask.photo}`
                                                    }
                                                    className="w-full h-full object-cover"
                                                    alt="Sampah warga"
                                                />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Camera className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                                    <p className="text-xs text-gray-400 italic">Petugas/Warga tidak melampirkan foto lokasi penimbunan sampah.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Customer profile */}
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Profil Pelanggan</h4>
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                                                {detailTask.customer?.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-805 truncate">{detailTask.customer?.name}</p>
                                                <p className="text-[10px] text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full w-fit uppercase font-semibold mt-0.5">
                                                    {(detailTask.customer?.customer_type || 'rumah_tangga').replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-200/50 space-y-2 text-xs">
                                            <div className="flex items-center gap-2 text-slate-650">
                                                <Phone className="h-4 w-4 shrink-0 text-emerald-650" />
                                                <span className="font-semibold">{detailTask.customer?.phone || '-'}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-slate-650">
                                                <MapPin className="h-4 w-4 shrink-0 text-emerald-655 mt-0.5" />
                                                <span className="leading-relaxed">{detailTask.customer?.address || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Status logs */}
                                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                                        <h4 className="text-xs font-bold text-emerald-990 uppercase tracking-wide flex items-center gap-1">
                                            <Shield className="h-4 w-4" /> Alur Tindak Lanjut
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Status Saat Ini:</span>
                                                <span className={statusBadge(detailTask.status)}>{detailTask.status}</span>
                                            </div>
                                            {detailTask.status !== 'selesai' && detailTask.status !== 'batal' && (
                                                <div className="pt-2 border-t border-emerald-100 flex gap-1.5">
                                                    <button
                                                        onClick={() => handleUpdateStatus(detailTask.id, 'diproses')}
                                                        className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10.5px] font-bold transition-all"
                                                    >
                                                        Proses
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(detailTask.id, 'dalam perjalanan')}
                                                        className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10.5px] font-bold transition-all"
                                                    >
                                                        Jalan
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDetailTask(null);
                                                            setSelectedTask(detailTask);
                                                        }}
                                                        className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10.5px] font-bold transition-all"
                                                    >
                                                        Selesaikan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t border-slate-100 rounded-b-3xl text-right">
                            <button
                                onClick={() => setDetailTask(null)}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficerDashboard;
