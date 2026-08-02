import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import SEO from '../components/SEO';

const Register: React.FC = () => {
    const { register: registerAuth } = useAuth();
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Cascading Address states
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [villages, setVillages] = useState<any[]>([]);

    const { register, handleSubmit, watch, setValue } = useForm();

    const selectedProvince = watch('province_id');
    const selectedCity = watch('city_id');
    const selectedDistrict = watch('district_id');

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
                const data = await res.json();
                setProvinces(data);
            } catch (err) {
                console.error('Province fetch error', err);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch cities on province change
    useEffect(() => {
        if (!selectedProvince) {
            setCities([]);
            return;
        }
        const fetchCities = async () => {
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`);
                const data = await res.json();
                setCities(data);
                setValue('city_id', '');
                setValue('district_id', '');
                setValue('village_id', '');
            } catch (err) {
                console.error(err);
            }
        };
        fetchCities();
    }, [selectedProvince, setValue]);

    // Fetch districts on city change
    useEffect(() => {
        if (!selectedCity) {
            setDistricts([]);
            return;
        }
        const fetchDistricts = async () => {
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity}.json`);
                const data = await res.json();
                setDistricts(data);
                setValue('district_id', '');
                setValue('village_id', '');
            } catch (err) {
                console.error(err);
            }
        };
        fetchDistricts();
    }, [selectedCity, setValue]);

    // Fetch villages on district change
    useEffect(() => {
        if (!selectedDistrict) {
            setVillages([]);
            return;
        }
        const fetchVillages = async () => {
            try {
                const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict}.json`);
                const data = await res.json();
                setVillages(data);
                setValue('village_id', '');
            } catch (err) {
                console.error(err);
            }
        };
        fetchVillages();
    }, [selectedDistrict, setValue]);

    const useCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setValue('latitude', position.coords.latitude.toFixed(8));
                    setValue('longitude', position.coords.longitude.toFixed(8));
                },
                (err) => {
                    console.error(err);
                    alert('Gagal mengambil titik koordinat GPS dari browser Anda.');
                }
            );
        } else {
            alert('Browser Anda tidak mendukung Geolocation.');
        }
    };

    const onSubmit = async (data: any) => {
        setErrorMsg(null);
        if (data.password !== data.password_confirmation) {
            setErrorMsg('Konfirmasi password tidak cocok.');
            return;
        }

        try {
            await registerAuth(data);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || 'Registrasi gagal. Coba lagi beberapa saat.');
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto my-20 px-4 text-center">
                <SEO title="Registrasi Berhasil" description="Registrasi akun ResikApp berhasil." />
                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm space-y-6">
                    <div className="flex justify-center text-emerald-600">
                        <CheckCircle2 className="h-16 w-16 animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Registrasi Berhasil!</h2>
                    <p className="text-sm text-gray-500 leading-relaxed font-normal">
                        Akun Anda sudah terdaftar di sistem. Mohon bersabar dan menunggu proses verifikasi administrative oleh tim Admin sebelum Anda dapat masuk ke dasbor.
                    </p>
                    <Link
                        to="/login"
                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                        Lanjut ke Halaman Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto my-12 px-4">
            <SEO title="Daftar" description="Daftar akun ResikApp baru." />
            <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Daftar Akun Baru</h2>
                    <p className="text-xs text-gray-400 mt-1">Daftarkan profil pemukiman/bisnis Anda untuk iuran angkutan sampah</p>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex gap-2 border border-red-100">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                {...register('name', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="contoh: Andi"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">No Handphone</label>
                            <input
                                type="text"
                                {...register('phone', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="contoh: 0812xxxx"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email</label>
                            <input
                                type="email"
                                {...register('email', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="andi@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Tipe Pelanggan</label>
                            <select
                                {...register('customer_type', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                required
                            >
                                <option value="rumah_tangga">Rumah Tangga</option>
                                <option value="komersial">Komersial/Pertokoan</option>
                            </select>
                        </div>
                    </div>

                    {/* Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Password</label>
                            <input
                                type="password"
                                {...register('password', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Konfirmasi Password</label>
                            <input
                                type="password"
                                {...register('password_confirmation', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Informasi Alamat</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Provinsi</label>
                                <select
                                    {...register('province_id', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    required
                                >
                                    <option value="">Pilih Provinsi</option>
                                    {provinces.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Kota / Kabupaten</label>
                                <select
                                    {...register('city_id', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    disabled={cities.length === 0}
                                    required
                                >
                                    <option value="">Pilih Kota/Kab</option>
                                    {cities.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Kecamatan</label>
                                <select
                                    {...register('district_id', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    disabled={districts.length === 0}
                                    required
                                >
                                    <option value="">Pilih Kecamatan</option>
                                    {districts.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Kelurahan / Desa</label>
                                <select
                                    {...register('village_id', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    disabled={villages.length === 0}
                                    required
                                >
                                    <option value="">Pilih Kelurahan</option>
                                    {villages.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Alamat Jalan Lengkap</label>
                            <textarea
                                rows={3}
                                {...register('address', { required: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                placeholder="Nama jalan, nomor rumah, rt/rw..."
                                required
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Kode Pos</label>
                                <input
                                    type="text"
                                    {...register('postal_code')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    placeholder="401xxx"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Latitude</label>
                                <input
                                    type="text"
                                    {...register('latitude')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-slate-50"
                                    placeholder="-6.123456"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Longitude</label>
                                <input
                                    type="text"
                                    {...register('longitude')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-slate-50"
                                    placeholder="107.123456"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={useCurrentLocation}
                                className="inline-flex items-center gap-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Navigation className="h-4 w-4" /> Dapatkan Koordinat GPS
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                    >
                        Kirim Registrasi Saya
                    </button>
                </form>

                <div className="border-t border-gray-150 pt-4 text-center text-xs text-gray-500">
                    Sudah punya akun? <Link to="/login" className="text-emerald-600 hover:underline font-semibold">Silakan login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
