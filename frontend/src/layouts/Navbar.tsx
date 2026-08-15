import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { Trash2, LogOut, LayoutDashboard, Home, Newspaper, HelpCircle, User, Truck } from 'lucide-react';
import { getApiBaseUrl } from '../services/api';

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { company } = useCompany();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getDashboardPath = () => {
        if (!user) return '/';
        if (user.role?.slug === 'super-admin') return '/admin';
        if (user.role?.slug === 'petugas') return '/officer';
        return '/customer';
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                {company.logo ? (
                                    <img src={company.logo.startsWith('http') ? company.logo : `${getApiBaseUrl()}${company.logo}`} alt="Logo" className="h-8 max-w-[4rem] w-auto object-contain" />
                                ) : (
                                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                        <Trash2 className="h-6 w-6" />
                                    </div>
                                )}
                                <span className="font-bold text-xl text-gray-900 tracking-tight">{company.name}</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className={`font-medium transition-colors ${isActive('/') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}>Beranda</Link>
                            <Link to="/layanan" className={`font-medium transition-colors ${isActive('/layanan') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}>Layanan</Link>
                            <Link to="/berita" className={`font-medium transition-colors ${isActive('/berita') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}>Berita</Link>
                            <Link to="/faq" className={`font-medium transition-colors ${isActive('/faq') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}>FAQ</Link>

                            {isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to={getDashboardPath()}
                                        className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-sm"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link to="/login" className={`font-medium transition-colors ${isActive('/login') ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'}`}>Masuk</Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation Bar (Glassmorphic & Sticky) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around h-16 shadow-2xl pb-safe">
                <Link
                    to="/"
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${isActive('/') ? 'text-emerald-600 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
                >
                    <Home className="h-5 w-5" />
                    <span className="text-[9.5px] font-semibold mt-1">Beranda</span>
                </Link>
                <Link
                    to="/layanan"
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${isActive('/layanan') ? 'text-emerald-600 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
                >
                    <Truck className="h-5 w-5" />
                    <span className="text-[9.5px] font-semibold mt-1">Layanan</span>
                </Link>
                <Link
                    to="/berita"
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${isActive('/berita') || location.pathname.startsWith('/berita/') ? 'text-emerald-600 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
                >
                    <Newspaper className="h-5 w-5" />
                    <span className="text-[9.5px] font-semibold mt-1">Berita</span>
                </Link>
                <Link
                    to="/faq"
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${isActive('/faq') ? 'text-emerald-600 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
                >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-[9.5px] font-semibold mt-1">FAQ</span>
                </Link>
                {isAuthenticated ? (
                    <Link
                        to={getDashboardPath()}
                        className="flex flex-col items-center justify-center flex-1 py-1 text-gray-400 hover:text-emerald-500 transition-all"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-[9.5px] font-semibold mt-1">Dashboard</span>
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${isActive('/login') ? 'text-emerald-600 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
                    >
                        <User className="h-5 w-5" />
                        <span className="text-[9.5px] font-semibold mt-1">Masuk</span>
                    </Link>
                )}
            </div>
        </>
    );
};

export default Navbar;
