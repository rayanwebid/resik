import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            await login(data.email, data.password);
            const savedUserStr = localStorage.getItem('user');
            if (savedUserStr) {
                const user = JSON.parse(savedUserStr);
                if (user.role?.slug === 'super-admin') navigate('/admin');
                else if (user.role?.slug === 'petugas') navigate('/officer');
                else navigate('/customer');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || 'Login gagal. Silakan periksa kredensial Anda, pastikan akun sudah disetujui admin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-20 px-4">
            <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Masuk Akun</h2>
                    <p className="text-xs text-gray-400 mt-1">Silakan masuk menggunakan email dan password terdaftar Anda</p>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex gap-2 border border-red-100">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                {...register('email', { required: true })}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                {...register('password', { required: true })}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                    >
                        {isSubmitting ? 'Loading...' : 'Masuk'}
                    </button>
                </form>

                <div className="border-t border-gray-150 pt-4 text-center text-xs text-gray-500">
                    Belum terdaftar? <Link to="/register" className="text-emerald-600 hover:underline font-semibold">Buat akun baru</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
