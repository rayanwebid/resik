import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { useCompany } from '../contexts/CompanyContext';

const FAQ: React.FC = () => {
    const { company } = useCompany();
    const [faqs, setFaqs] = useState<any[]>([]);
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await api.get('/home-data');
                if (res.data.success && res.data.data.faqs) {
                    setFaqs(res.data.data.faqs);
                }
            } catch (err) {
                console.error('Fetch FAQs error, using mock fallback', err);
            }
        };
        fetchFaqs();
    }, []);

    const fallbackFaqs = [
        { question: 'Bagaimana cara mendaftar sebagai anggota?', answer: 'Anda dapat mendaftar dengan menekan tombol Daftar di bagian kanan atas navbar, mengisi profil alamat detail lengkap beserta titik koordinat GPS rumah Anda.' },
        { question: 'Berapa besaran biaya iuran pengelolaan sampah bulanan?', answer: 'Iuran bulanan disesuaikan dengan jenis pelanggan (rumah tangga/komersial) dan ditentukan oleh kebijakan pengelola lingkungan setempat.' },
        { question: 'Bagaimana cara mengajukan permintaan penjemputan sampah?', answer: 'Setelah login, masuk ke Dashboard Pelanggan lalu pilih menu Request Pickup. Isi detail estimasi berat, tanggal penjemputan, tipe sampah, serta foto sampah pendukung.' },
        { question: 'Apakah saya bisa memantau posisi petugas pengambil sampah?', answer: 'Ya. Melalui tracking GPS real-time, Anda dapat memantau pergerakan unit pengangkut sampah saat status pengantaran diubah menjadi "dalam perjalanan" oleh petugas lapangan.' }
    ];

    const list = faqs.length > 0 ? faqs : fallbackFaqs;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
                    <HelpCircle className="h-8 w-8 text-emerald-600" /> FAQ & Bantuan
                </h1>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed font-normal">
                    Temukan jawaban atas pertanyaan operasional yang paling sering ditanyakan oleh warga mengenai sistem {company.name}.
                </p>
            </div>

            <div className="space-y-4">
                {list.map((faq, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm">
                        <button
                            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                            className="w-full text-left p-6 font-bold text-gray-800 flex justify-between items-center transition-colors hover:bg-slate-50/50"
                        >
                            <span>{faq.question}</span>
                            {openIdx === idx ? <ChevronUp className="h-5 w-5 text-gray-405" /> : <ChevronDown className="h-5 w-5 text-gray-405" />}
                        </button>
                        {openIdx === idx && (
                            <div className="p-6 pt-0 border-t border-gray-100 text-sm text-gray-550 leading-relaxed font-normal bg-slate-50/10">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
