import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const BeritaDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [news, setNews] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const res = await api.get(`/news/${slug}`);
                if (res.data.success) {
                    setNews(res.data.data);
                } else {
                    setError('Artikel tidak ditemukan.');
                }
            } catch (err) {
                console.error(err);
                setError('Gagal memuat berita. Silakan coba beberapa saat lagi.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchNewsDetail();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs">
                <div className="text-red-500 text-sm font-bold mb-4">⚠️ {error || 'Artikel tidak ditemukan.'}</div>
                <Link to="/berita" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors cursor-pointer">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Berita
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <Link to="/berita" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold mb-8 transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Berita
            </Link>

            <article className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {news.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 mt-4 text-xs font-semibold text-slate-500 border-y border-slate-100 py-3">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{new Date(news.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4 text-slate-400" />
                            <span>{news.views || 0} Kali Dibaca</span>
                        </div>
                        <div className="text-emerald-600">
                            Ditulis oleh: <span className="font-bold">{news.author?.name || 'Admin'}</span>
                        </div>
                    </div>
                </div>

                {news.image && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-[50vh] bg-slate-50 flex items-center justify-center">
                        <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595275372274-1216652e008d?auto=format&fit=crop&w=800&q=80';
                            }}
                        />
                    </div>
                )}

                <div
                    className="prose prose-emerald max-w-none text-slate-700 leading-relaxed text-sm sm:text-base font-normal space-y-4 whitespace-pre-wrap"
                >
                    {news.content}
                </div>
            </article>
        </div>
    );
};

export default BeritaDetail;
