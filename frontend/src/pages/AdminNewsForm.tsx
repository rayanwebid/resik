import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Image as ImageIcon, XCircle } from 'lucide-react';
import { useCompany } from '../contexts/CompanyContext';

const AdminNewsForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { company } = useCompany();

    const [form, setForm] = useState({ title: '', summary: '', content: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit) {
            api.get(`/admin/news/${id}`)
                .then(res => {
                    const data = res.data.data;
                    setForm({ title: data.title, summary: data.summary || '', content: data.content });
                    if (data.image) {
                        setImagePreview(data.image.startsWith('http') ? data.image : `http://localhost:8000${data.image}`);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError('Gagal memuat data berita.');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('summary', form.summary);
            formData.append('content', form.content);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (isEdit) {
                // In Laravel, PUT with multipart form data sometimes has issues, 
                // so we use POST and can add _method field. But we already changed API to accept POST.
                await api.post(`/admin/news/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/news', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            alert(isEdit ? 'Berita berhasil diperbarui!' : 'Berita berhasil dibuat!');
            navigate('/admin'); // Return to dashboard, it will land on overview, ideally should be CMS via state.
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan berita.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Simple Top Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit Berita' : 'Tulis Berita Baru'}</h1>
                        <p className="text-[10px] text-slate-400">{company.name} CMS</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 animate-fade-in">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-sm text-red-700 items-center shadow-sm">
                        <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Detail Artikel</h2>
                        <p className="text-xs text-slate-500 mt-1">Lengkapi form di bawah ini untuk menerbitkan berita.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Judul Berita <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    placeholder="Masukkan judul yang menarik..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Ringkasan Singkat
                                </label>
                                <textarea
                                    value={form.summary}
                                    onChange={e => setForm({ ...form, summary: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                                    placeholder="Teks singkat yang akan muncul di daftar berita..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Isi Konten Lengkap <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all leading-relaxed"
                                    placeholder="Ketik seluruh isi artikel di sini..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Gambar Sampul
                                </label>

                                <div className="space-y-4">
                                    <div className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative transition-colors ${imagePreview ? 'border-transparent bg-slate-900' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs text-slate-400 font-medium">Belum ada gambar.</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <label className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors inline-block">
                                            Pilih File Gambar
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-2">Maksimal ukuran 2MB (JPG/PNG).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-3 pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                            <Link
                                to="/admin"
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {isEdit ? 'Simpan Perubahan' : 'Terbitkan Berita'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminNewsForm;
