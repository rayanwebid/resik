import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';

const Footer: React.FC = () => {
    const { company } = useCompany();
    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-white">
                            <div className="p-2 bg-emerald-500 rounded-lg">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">{company.name}</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-normal">
                            Sistem Informasi Manajemen Pelayanan Sampah Digital. Bersama kita wujudkan kota yang bersih, hijau, dan sehat secara berkelanjutan.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Navigasi</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Beranda</Link></li>
                            <li><Link to="/layanan" className="hover:text-emerald-400 transition-colors">Layanan</Link></li>
                            <li><Link to="/berita" className="hover:text-emerald-400 transition-colors">Berita</Link></li>
                            <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Layanan Rakyat</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Pendaftaran Anggota</Link></li>
                            <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Pengambilan Sampah</Link></li>
                            <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Pembayaran Digital</Link></li>
                            <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Tracking Petugas</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Hubungi Kami</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-start space-x-2">
                                <MapPin className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-slate-400">{company.address || 'Jl. Dago No. 123, Coblong, Bandung, Jawa Barat 40135'}</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-400">{company.phone || '+62 812-3456-7890'}</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-slate-400">{company.email || 'resikapp@sampah.go.id'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} {company.name} ResikApp. Hak Cipta Dilindungi.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
