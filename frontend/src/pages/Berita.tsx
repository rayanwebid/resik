import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
import api from '../services/api';

const Berita: React.FC = () => {
    const [newsList, setNewsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                if (res.data.success) {
                    setNewsList(res.data.data);
                }
            } catch (err) {
                console.error('Fetch news error, using mock data', err);
                // Fallback mock news
                setNewsList([
                    {
                        id: 1,
                        title: 'Sosialisasi Program Pemilahan Sampah Organik & Anorganik',
                        slug: 'sosialisasi-program-pemilahan-sampah-organik-anorganik',
                        summary: 'Dinas Kebersihan Kota menyelenggarakan penyuluhan pemilahan sampah mandiri untuk tingkat rumah tangga guna mereduksi tumpukan limbah.',
                        image: '',
                        views: 45,
                        created_at: new Date().toISOString(),
                    },
                    {
                        id: 2,
                        title: 'Peningkatan Armada Kebersihan di Kelurahan Coblong',
                        slug: 'peningkatan-armada-kebersihan-di-kelurahan-coblong',
                        summary: 'Guna mempercepat pelayanan warga, dinas kebersihan menambah dua unit truk pengambil sampah khusus anorganik di kecamatan Coblong.',
                        image: '',
                        views: 29,
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-12">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                    Berita Lingkungan & Aktivitas
                </h1>
                <p className="text-gray-600 mt-2 text-sm">
                    Simak kumpulan kabar berita kebersihan kota, kegiatan pengelolaan sampah terpadu, serta program go green terbaru.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsList.map((news) => (
                        <article key={news.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    {news.image ? (
                                        <img src={news.image} alt={news.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <span>No Image Available</span>
                                    )}
                                </div>

                                <div className="p-6 space-y-3">
                                    <h3 className="font-bold text-gray-900 text-lg hover:text-emerald-700 leading-snug line-clamp-2">
                                        <Link to={`/berita/${news.slug}`}>{news.title}</Link>
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-normal">{news.summary}</p>
                                </div>
                            </div>

                            <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{new Date(news.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>{news.views || 0} dibaca</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Berita;
