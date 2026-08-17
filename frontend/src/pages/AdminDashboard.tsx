import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Users, UserCheck, CreditCard, LogOut,
    Clock, UserPlus, ArrowRightLeft, Truck,
    CheckCircle2, XCircle, AlertCircle, RefreshCw,
    ChevronDown, Search, Shield, TrendingUp, Banknote, Eye,
    FileText, Globe, Plus, Trash2, Edit, MapPin, Printer
} from 'lucide-react';
import api, { getApiBaseUrl } from '../services/api';
import { useCompany } from '../contexts/CompanyContext';
import type { User, Officer, PickupRequest, Payment, WorkRegion, PaymentMethod } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SEO from '../components/SEO';

// Fix leaflet default icon missing issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamic Map Controller to center map view on active officers
const MapController: React.FC<{ officers: Officer[] }> = ({ officers }) => {
    const map = useMap();
    useEffect(() => {
        const points = officers
            .filter(o => o.latitude != null && o.longitude != null && !isNaN(parseFloat(String(o.latitude))) && !isNaN(parseFloat(String(o.longitude))))
            .map(o => [parseFloat(String(o.latitude)), parseFloat(String(o.longitude))] as [number, number]);

        if (points.length === 1) {
            map.setView(points[0], 14);
        } else if (points.length > 1) {
            const bounds = L.latLngBounds(points);
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [officers, map]);

    return null;
};

const typeLabel = (type: string): string => {
    const map: Record<string, string> = {
        bank_transfer: 'Transfer Bank',
        qris: 'QRIS',
        cash: 'Bayar Cash',
        virtual_account: 'Virtual Account',
    };
    return map[type] || type;
};

const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const openInvoiceInWindow = async (relativeUrl: string) => {
    try {
        const res = await api.get(relativeUrl, { responseType: 'text' });
        const newWin = window.open('', '_blank', 'width=820,height=900,scrollbars=yes');
        if (newWin) {
            newWin.document.write(res.data);
            newWin.document.close();
        }
    } catch (err) {
        console.error('Gagal membuka invoice:', err);
    }
};

const paymentStatusLabel: Record<string, string> = {
    Paid: 'Lunas',
    Unpaid: 'Belum Bayar',
    Pending: 'Menunggu Verifikasi',
    Failed: 'Gagal',
    Cancelled: 'Dibatalkan',
    'Jatuh Tempo': 'Lewat Jatuh Tempo',
};

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { company, refreshCompany } = useCompany();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'officers' | 'assignments' | 'payments' | 'payment_methods' | 'cms' | 'regions'>('overview');

    // States
    const [stats, setStats] = useState({
        total_customers: 0,
        total_officers: 0,
        pending_approvals: 0,
        unpaid_bills: 0,
        total_revenue: 0,
    });
    const [pendingCustomers, setPendingCustomers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [pickups, setPickups] = useState<PickupRequest[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Work Regions states
    const [workRegions, setWorkRegions] = useState<WorkRegion[]>([]);
    const [searchRegion, setSearchRegion] = useState('');
    const [showWorkRegionModal, setShowWorkRegionModal] = useState(false);
    const [editingWorkRegion, setEditingWorkRegion] = useState<WorkRegion | null>(null);
    const [workRegionForm, setWorkRegionForm] = useState({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });
    const [workRegionLoading, setWorkRegionLoading] = useState(false);

    // CMS & News management states
    const [news, setNews] = useState<any[]>([]);
    const [editNewsItem, setEditNewsItem] = useState<any | null>(null);
    const [newsForm, setNewsForm] = useState({ title: '', summary: '', content: '', image: '' });
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [cmsSubTab, setCmsSubTab] = useState<'news' | 'profile'>('news');

    // Payment Methods management states
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentMethodForm, setPaymentMethodForm] = useState({
        name: '',
        type: 'bank_transfer',
        bank_name: '',
        account_number: '',
        account_holder: '',
        image_path: '',
        description: '',
    });
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
    const [settings, setSettings] = useState({
        name: 'SI-SAMPAH',
        history: '',
        vision: '',
        mission: '',
        address: '',
        phone: '',
        email: '',
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState(false);
    const [settingsError, setSettingsError] = useState<string | null>(null);
    const [settingsLogo, setSettingsLogo] = useState<File | null>(null);
    const [settingsFavicon, setSettingsFavicon] = useState<File | null>(null);

     // Selected items for Details/Preview Modal
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

    // Search states
    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchPayment, setSearchPayment] = useState('');

    // Payment due day editing
    const [updatingDueDayId, setUpdatingDueDayId] = useState<number | null>(null);
    const [dueDayCache, setDueDayCache] = useState<Record<number, number | undefined>>({});
    const [monthlyFeeCache, setMonthlyFeeCache] = useState<Record<number, number | undefined>>({});

    // Customer CRUD (inline form, no popup)
    const [customerFormOpen, setCustomerFormOpen] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
    const [customerFormLoading, setCustomerFormLoading] = useState(false);
    const [customerFormError, setCustomerFormError] = useState<string | null>(null);
    const [customerForm, setCustomerForm] = useState({
        name: '', email: '', password: '', phone: '', address: '', payment_due_day: '', monthly_fee: '50000', status: 'active'
    });

    // New Officer form state
    const [officerForm, setOfficerForm] = useState({
        name: '', email: '', password: 'petugas123',
        nik: '', phone: '', address: '', region: 'Coblong',
    });
    const [officerLoading, setOfficerLoading] = useState(false);
    const [officerSuccess, setOfficerSuccess] = useState(false);
    const [officerError, setOfficerError] = useState<string | null>(null);

    // Assignment states
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
    const [assignLoading, setAssignLoading] = useState(false);

    // Create new pickup (by admin) states
    const [showCreatePickup, setShowCreatePickup] = useState(false);
    const [createPickupForm, setCreatePickupForm] = useState({
        customer_id: '',
        date: '',
        time: '',
        waste_type: 'organik',
        estimated_weight: '5',
        notes: '',
        officer_id: '',
    });
    const [createPickupLoading, setCreatePickupLoading] = useState(false);
    const [createPickupError, setCreatePickupError] = useState<string | null>(null);
    const [createPickupSuccess, setCreatePickupSuccess] = useState(false);

    // Payment states
    const [confirmingPaymentId, setConfirmingPaymentId] = useState<number | null>(null);
    const [paymentActionLoading, setPaymentActionLoading] = useState(false);

    const fetchData = async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        try {
            const [resDash, resCust, resOff, resPayments, resNews, resSettings, resWorkRegions, resPaymentMethods] = await Promise.allSettled([
                api.get('/admin/dashboard'),
                api.get('/admin/customers'),
                api.get('/admin/officers'),
                api.get('/admin/payments'),
                api.get('/admin/news'),
                api.get('/admin/settings'),
                api.get('/admin/work-regions'),
                api.get('/admin/payment-methods'),
            ]);

            if (resDash.status === 'fulfilled' && resDash.value.data.success) {
                const d = resDash.value.data.data;
                setStats({
                    total_customers: d.summary?.total_customers ?? 0,
                    total_officers: d.summary?.total_officers ?? 0,
                    pending_approvals: d.summary?.pending_approvals ?? 0,
                    unpaid_bills: d.summary?.unpaid_bills ?? 0,
                    total_revenue: d.summary?.total_revenue ?? 0,
                });
                setPendingCustomers(d.pending_customers ?? []);
                setPickups(d.active_requests ?? []);
                setMonthlyRevenue(d.monthly_revenue ?? []);
            }
            if (resCust.status === 'fulfilled' && resCust.value.data.success) {
                setCustomers(resCust.value.data.data);
            }
            if (resOff.status === 'fulfilled' && resOff.value.data.success) {
                setOfficers(resOff.value.data.data);
            }
            if (resPayments.status === 'fulfilled' && resPayments.value.data.success) {
                setPayments(resPayments.value.data.data);
            }
            if (resNews.status === 'fulfilled' && resNews.value.data.success) {
                setNews(resNews.value.data.data);
            }
            if (resSettings.status === 'fulfilled' && resSettings.value.data.success) {
                setSettings(resSettings.value.data.data);
            }
            if (resWorkRegions.status === 'fulfilled' && resWorkRegions.value.data.success) {
                setWorkRegions(resWorkRegions.value.data.data);
            }
            if (resPaymentMethods.status === 'fulfilled' && resPaymentMethods.value.data.success) {
                setPaymentMethods(resPaymentMethods.value.data.data);
            }
        } catch (err) {
            console.error('Admin dashboard load error', err);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchWorkRegions = async () => {
        try {
            const res = await api.get('/admin/work-regions');
            if (res.data.success) {
                setWorkRegions(res.data.data);
            }
        } catch (err) {
            console.error('Fetch work regions error', err);
        }
    };

    const handleSaveWorkRegion = async (e: React.FormEvent) => {
        e.preventDefault();
        setWorkRegionLoading(true);
        try {
            if (editingWorkRegion) {
                const res = await api.put(`/admin/work-regions/${editingWorkRegion.id}`, workRegionForm);
                if (res.data.success) {
                    alert(res.data.message);
                }
            } else {
                const res = await api.post('/admin/work-regions', workRegionForm);
                if (res.data.success) {
                    alert(res.data.message);
                }
            }
            setShowWorkRegionModal(false);
            setEditingWorkRegion(null);
            setWorkRegionForm({ name: '', code: '', description: '', is_active: true });
            fetchWorkRegions();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal menyimpan data wilayah kerja.');
        } finally {
            setWorkRegionLoading(false);
        }
    };

    const handleToggleWorkRegion = async (id: number) => {
        try {
            const res = await api.post(`/admin/work-regions/${id}/toggle`);
            if (res.data.success) {
                fetchWorkRegions();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal mengubah status wilayah kerja.');
        }
    };

    const handleDeleteWorkRegion = async (id: number, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus wilayah kerja "${name}"?`)) return;
        try {
            const res = await api.delete(`/admin/work-regions/${id}`);
            if (res.data.success) {
                alert(res.data.message);
                fetchWorkRegions();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus wilayah kerja.');
        }
    };

    const handleNewsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editNewsItem) {
                const res = await api.put(`/admin/news/${editNewsItem.id}`, newsForm);
                if (res.data.success) {
                    alert('Berita berhasil diperbarui.');
                    setIsNewsModalOpen(false);
                    setEditNewsItem(null);
                    setNewsForm({ title: '', summary: '', content: '', image: '' });
                    fetchData(true);
                }
            } else {
                const res = await api.post('/admin/news', newsForm);
                if (res.data.success) {
                    alert('Berita baru berhasil ditayangkan.');
                    setIsNewsModalOpen(false);
                    setNewsForm({ title: '', summary: '', content: '', image: '' });
                    fetchData(true);
                }
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan berita.');
        }
    };

    const handleDeleteNews = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;
        try {
            const res = await api.delete(`/admin/news/${id}`);
            if (res.data.success) {
                alert('Berita berhasil dihapus.');
                fetchData(true);
            }
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus berita.');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);
        setSettingsSuccess(false);
        setSettingsError(null);
        try {
            const formData = new FormData();
            Object.keys(settings).forEach(key => {
                if (key !== 'logo' && key !== 'favicon') {
                    formData.append(key, (settings as any)[key] || '');
                }
            });
            if (settingsLogo) formData.append('logo', settingsLogo);
            if (settingsFavicon) formData.append('favicon', settingsFavicon);

            const res = await api.post('/admin/settings', formData);
            if (res.data.success) {
                setSettingsSuccess(true);
                setTimeout(() => setSettingsSuccess(false), 4000);
                fetchData(false);
                refreshCompany(); // update Navbar & Footer langsung
            } else {
                setSettingsError('Respons tidak valid dari server.');
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message
                || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null)
                || 'Gagal menyimpan pengaturan. Periksa koneksi server.';
            setSettingsError(msg as string);
        } finally {
            setSettingsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApproveCustomer = async (userId: number) => {
        try {
            const res = await api.post(`/admin/customers/${userId}/approve`);
            if (res.data.success) fetchData(true);
        } catch (err) { console.error(err); }
    };

    const handleRejectCustomer = async (userId: number) => {
        try {
            const res = await api.post(`/admin/customers/${userId}/reject`);
            if (res.data.success) fetchData(true);
        } catch (err) { console.error(err); }
    };

    const handleUpdatePaymentDueDay = async (customerId: number, dueDay: number) => {
        setUpdatingDueDayId(customerId);
        try {
            const res = await api.put(`/admin/customers/${customerId}/payment-due-day`, {
                payment_due_day: dueDay,
            });
            if (res.data.success) {
                fetchData(false);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal mengatur tanggal jatuh tempo.');
        } finally {
            setUpdatingDueDayId(null);
        }
    };

    const handleUpdateMonthlyFee = async (customerId: number, monthlyFee: number) => {
        setUpdatingDueDayId(customerId);
        try {
            const res = await api.put(`/admin/customers/${customerId}/monthly-fee`, { monthly_fee: monthlyFee });
            if (res.data.success) fetchData(false);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Gagal mengatur jumlah iuran.');
        } finally {
            setUpdatingDueDayId(null);
        }
    };

    const resetCustomerForm = () => {
        setCustomerForm({ name: '', email: '', password: '', phone: '', address: '', payment_due_day: '', monthly_fee: '50000', status: 'active' });
        setEditingCustomerId(null);
        setCustomerFormError(null);
    };

    const startEditCustomer = (customer: any) => {
        setEditingCustomerId(customer.id);
        setCustomerForm({
            name: customer.user?.name ?? customer.name ?? '',
            email: customer.user?.email ?? customer.email ?? '',
            password: '', phone: customer.phone ?? '', address: customer.address ?? '',
            payment_due_day: customer.payment_due_day?.toString() ?? '',
            monthly_fee: customer.monthly_fee?.toString() ?? '50000',
            status: customer.user?.status ?? customer.status ?? 'active',
        });
        setCustomerFormError(null);
        setCustomerFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCustomerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCustomerFormLoading(true);
        setCustomerFormError(null);
        try {
            const payload: any = { ...customerForm };
            if (payload.payment_due_day) payload.payment_due_day = parseInt(payload.payment_due_day, 10);
            else delete payload.payment_due_day;
            payload.monthly_fee = Number(payload.monthly_fee || 0);
            if (editingCustomerId && !payload.password) delete payload.password;
            const res = editingCustomerId
                ? await api.put(`/admin/customers/${editingCustomerId}`, payload)
                : await api.post('/admin/customers', payload);
            if (res.data.success) {
                resetCustomerForm();
                setCustomerFormOpen(false);
                await fetchData(false);
            }
        } catch (err: any) {
            setCustomerFormError(err.response?.data?.message || Object.values(err.response?.data?.errors ?? {}).flat().join(' ') || 'Gagal menyimpan data pelanggan.');
        } finally {
            setCustomerFormLoading(false);
        }
    };

    const handleDeleteCustomer = async (customer: any) => {
        const name = customer.user?.name ?? customer.name ?? 'pelanggan ini';
        if (!window.confirm(`Hapus pelanggan ${name}? Data tagihan dan riwayat terkait juga akan terhapus.`)) return;
        try {
            const res = await api.delete(`/admin/customers/${customer.id}`);
            if (res.data.success) fetchData(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus pelanggan.');
        }
    };

    const handleToggleOfficer = async (officerId: number) => {
        try {
            const res = await api.post(`/admin/officers/${officerId}/toggle`);
            if (res.data.success) fetchData(true);
        } catch (err) { console.error(err); }
    };

    const handleCreateOfficer = async (e: React.FormEvent) => {
        e.preventDefault();
        setOfficerLoading(true);
        setOfficerError(null);
        setOfficerSuccess(false);
        try {
            const res = await api.post('/admin/officers', officerForm);
            if (res.data.success) {
                setOfficerSuccess(true);
                setOfficerForm({ name: '', email: '', password: 'petugas123', nik: '', phone: '', address: '', region: 'Coblong' });
                fetchData(false);
                setTimeout(() => setOfficerSuccess(false), 4000);
            }
        } catch (err: any) {
            setOfficerError(err.response?.data?.message || 'Gagal mendaftarkan petugas baru.');
        } finally {
            setOfficerLoading(false);
        }
    };

    const handleAssignPickup = async (pickupId: number) => {
        if (!selectedOfficerId) return;
        setAssignLoading(true);
        try {
            const res = await api.post(`/admin/pickup-requests/${pickupId}/assign`, {
                officer_id: parseInt(selectedOfficerId)
            });
            if (res.data.success) {
                setAssigningId(null);
                setSelectedOfficerId('');
                fetchData(true);
            }
        } catch (err) { console.error(err); }
        finally { setAssignLoading(false); }
    };

    const handleCreatePickup = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatePickupLoading(true);
        setCreatePickupError(null);
        setCreatePickupSuccess(false);
        try {
            const payload: any = {
                customer_id: parseInt(createPickupForm.customer_id),
                date: createPickupForm.date,
                time: createPickupForm.time,
                waste_type: createPickupForm.waste_type,
                estimated_weight: parseFloat(createPickupForm.estimated_weight),
                notes: createPickupForm.notes || null,
            };
            if (createPickupForm.officer_id) {
                payload.officer_id = parseInt(createPickupForm.officer_id);
            }
            const res = await api.post('/admin/pickup-requests', payload);
            if (res.data.success) {
                setCreatePickupSuccess(true);
                setCreatePickupForm({
                    customer_id: '', date: '', time: '', waste_type: 'organik',
                    estimated_weight: '5', notes: '', officer_id: '',
                });
                fetchData(false);
                setTimeout(() => {
                    setShowCreatePickup(false);
                    setCreatePickupSuccess(false);
                }, 2500);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message
                || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null)
                || 'Gagal membuat penugasan. Periksa koneksi server.';
            setCreatePickupError(msg as string);
        } finally {
            setCreatePickupLoading(false);
        }
    };

    const handlePaymentAction = async (paymentId: number, action: 'approve' | 'reject') => {
        setPaymentActionLoading(true);
        try {
            const res = await api.post(`/admin/payments/${paymentId}/confirm`, { action });
            if (res.data.success) {
                setConfirmingPaymentId(null);
                fetchData(true);
            }
        } catch (err) { console.error(err); }
        finally { setPaymentActionLoading(false); }
    };

    const openPaymentMethodModal = (method: PaymentMethod | null = null) => {
        setEditingPaymentMethod(method);
        if (method) {
            setPaymentMethodForm({
                name: method.name,
                type: method.type,
                bank_name: method.bank_name || '',
                account_number: method.account_number || '',
                account_holder: method.account_holder || '',
                image_path: method.image_path || '',
                description: method.description || '',
            });
        } else {
            setPaymentMethodForm({
                name: '',
                type: 'bank_transfer',
                bank_name: '',
                account_number: '',
                account_holder: '',
                image_path: '',
                description: '',
            });
        }
        setShowPaymentMethodModal(true);
    };

    const closePaymentMethodModal = () => {
        setShowPaymentMethodModal(false);
        setEditingPaymentMethod(null);
        setPaymentMethodForm({
            name: '',
            type: 'bank_transfer',
            bank_name: '',
            account_number: '',
            account_holder: '',
            image_path: '',
            description: '',
        });
    };

    const handleSavePaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentMethodLoading(true);
        try {
            const payload: any = { ...paymentMethodForm };
            if (editingPaymentMethod) {
                const res = await api.put(`/admin/payment-methods/${editingPaymentMethod.id}`, payload);
                if (res.data.success) { alert('Metode pembayaran berhasil diperbarui.'); fetchData(false); }
            } else {
                const res = await api.post('/admin/payment-methods', payload);
                if (res.data.success) { alert('Metode pembayaran berhasil ditambahkan.'); fetchData(false); }
            }
            setShowPaymentMethodModal(false);
            setEditingPaymentMethod(null);
        } catch (err) { console.error(err); alert('Gagal menyimpan metode pembayaran.'); }
        finally { setPaymentMethodLoading(false); }
    };

    const handleDeletePaymentMethod = async (id: number, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) return;
        try {
            const res = await api.delete(`/admin/payment-methods/${id}`);
            if (res.data.success) { alert('Metode pembayaran berhasil dihapus.'); fetchData(false); }
        } catch (err) { console.error(err); alert('Gagal menghapus metode pembayaran.'); }
    };

    const togglePaymentMethod = async (method: PaymentMethod) => {
        try {
            await api.put(`/admin/payment-methods/${method.id}`, { ...method, is_active: !method.is_active });
            fetchData(false);
        } catch (err) { console.error(err); alert('Gagal mengubah status metode pembayaran.'); }
    };

    const filteredCustomers = customers.filter(c =>
        (c.user?.name ?? c.name ?? '').toLowerCase().includes(searchCustomer.toLowerCase()) ||
        (c.user?.email ?? c.email ?? '').toLowerCase().includes(searchCustomer.toLowerCase())
    );
    const filteredPayments = payments.filter(p =>
        (p.customer?.user?.name ?? p.customer?.name ?? '').toLowerCase().includes(searchPayment.toLowerCase())
    );

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            menunggu: 'bg-amber-100 text-amber-800',
            diproses: 'bg-blue-100 text-blue-700',
            'dalam perjalanan': 'bg-indigo-100 text-indigo-700',
            selesai: 'bg-emerald-100 text-emerald-800',
            batal: 'bg-red-100 text-red-700',
            Paid: 'bg-emerald-100 text-emerald-800',
            Unpaid: 'bg-red-100 text-red-700',
            Pending: 'bg-amber-100 text-amber-800',
            active: 'bg-emerald-100 text-emerald-800',
            pending: 'bg-amber-100 text-amber-800',
            inactive: 'bg-slate-100 text-slate-600',
        };
        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${map[status] ?? 'bg-slate-100 text-slate-700'}`;
    };

    // Tampilan loading layar penuh dihapus agar panel administrasi memuat lebih instan

    const navItems = [
        { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard, badge: null },
        { id: 'customers', label: 'Verifikasi Pelanggan', icon: UserCheck, badge: stats.pending_approvals || null },
        { id: 'officers', label: 'Petugas Lapangan', icon: UserPlus, badge: null },
        { id: 'regions', label: 'Wilayah Kerja', icon: MapPin, badge: null },
        { id: 'assignments', label: 'Penugasan Pickup', icon: ArrowRightLeft, badge: pickups.filter(p => !p.officer_id).length || null },
        { id: 'payments', label: 'Verifikasi Pembayaran', icon: CreditCard, badge: stats.unpaid_bills || null },
        { id: 'payment_methods', label: 'Metode Pembayaran', icon: Banknote, badge: null },
        { id: 'cms', label: 'Konten & Berita', icon: FileText, badge: null },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <SEO title="Dasbor Admin" description="Dasbor admin ResikApp." />
            {/* ─── SIDEBAR ─────────────────────────────── */}
            <aside className="hidden md:flex w-64 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shrink-0 shadow-2xl">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-slate-700/60">
                    <div className="flex items-center gap-3">
                        {company.logo ? (
                            <img src={company.logo.startsWith('http') ? company.logo : `${getApiBaseUrl()}${company.logo}`} alt="Logo" className="h-10 w-auto max-w-[4rem] object-contain rounded-xl bg-white p-1 shadow-sm" />
                        ) : (
                            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div>
                            <p className="text-white font-bold text-sm tracking-wide">{company.name}</p>
                            <p className="text-emerald-400 text-xs font-medium">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as typeof activeTab)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${activeTab === item.id
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-3">
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </span>
                            {item.badge ? (
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </nav>

                {/* User info + logout */}
                <div className="p-3 border-t border-slate-700/60">
                    <div className="flex items-center gap-3 px-3 py-3 bg-slate-700/40 rounded-xl mb-2">
                        <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar dari Panel
                    </button>
                </div>
            </aside>

            {/* ─── MAIN CONTENT ─────────────────────────── */}
            <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 px-4 md:px-8 py-3.5 md:py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-base md:text-lg font-bold text-slate-900 leading-none">
                            {navItems.find(n => n.id === activeTab)?.label}
                        </h1>
                        <p className="text-[10px] md:text-xs text-slate-400 mt-1 truncate max-w-[200px] sm:max-w-xs">{company.name} — Sistem Informasi Manajemen Sampah</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchData(true)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="md:hidden p-1.5 text-slate-500 hover:text-red-500 rounded bg-slate-50 border border-slate-200 transition-colors"
                            title="Keluar"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </header>

                {/* Mobile Bottom Navigation Bar (Glassmorphic) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around h-16 shadow-2xl px-1 pb-safe">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as typeof activeTab)}
                            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${activeTab === item.id ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400'}`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[8.5px] mt-0.5 tracking-tight truncate max-w-[60px]">
                                {item.id === 'overview' ? 'Ringkasan' :
                                    item.id === 'customers' ? 'Pelanggan' :
                                        item.id === 'officers' ? 'Petugas' :
                                            item.id === 'regions' ? 'Wilayah' :
                                                item.id === 'assignments' ? 'Pickup' :
                                                    item.id === 'payments' ? 'Iuran' :
                                                        item.id === 'cms' ? 'Berita' : item.label}
                            </span>
                            {item.badge ? (
                                <span className="absolute top-0.5 right-2 text-[8px] font-bold px-1 py-0.2 bg-red-500 text-white rounded-full scale-90">
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>

                <div className="p-8 space-y-8">

                    {/* ═══ TAB 1: OVERVIEW ═════════════════════════ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                                {[
                                    { label: 'Total Pelanggan', value: stats.total_customers, icon: Users, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
                                    { label: 'Petugas Lapangan', value: stats.total_officers, icon: Truck, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
                                    { label: 'Menunggu Persetujuan', value: stats.pending_approvals, icon: Clock, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
                                    { label: 'Tagihan Belum Dibayar', value: stats.unpaid_bills, icon: AlertCircle, color: 'red', bg: 'bg-red-50', text: 'text-red-600' },
                                    { label: 'Total Pendapatan', value: `Rp ${Number(stats.total_revenue).toLocaleString('id-ID')}`, icon: TrendingUp, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                                ].map((kpi, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`p-2.5 ${kpi.bg} rounded-xl`}>
                                                <kpi.icon className={`h-5 w-5 ${kpi.text}`} />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900 mb-1">{kpi.value}</p>
                                        <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Pending Customers & Active Pickups */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Pending Approvals */}
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900">Menunggu Verifikasi</h3>
                                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-semibold">{pendingCustomers.length} pending</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {pendingCustomers.length > 0 ? pendingCustomers.slice(0, 5).map((c: any) => (
                                            <div key={c.id} className="px-6 py-3.5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                                                        {c.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                                                        <p className="text-xs text-slate-400">{c.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleApproveCustomer(c.id)}
                                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                                >
                                                    Setujui
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="px-6 py-8 text-center text-slate-400 text-sm italic">
                                                Tidak ada pelanggan yang perlu diverifikasi.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Active Pickups */}
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900">Request Penjemputan Aktif</h3>
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-semibold">{pickups.length} aktif</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {pickups.length > 0 ? pickups.slice(0, 5).map((p: any) => (
                                            <div key={p.id} className="px-6 py-3.5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{p.customer?.user?.name ?? p.customer?.name ?? 'Pelanggan'}</p>
                                                    <p className="text-xs text-slate-400">{p.date} • {p.waste_type} • {p.estimated_weight} kg</p>
                                                </div>
                                                <span className={statusBadge(p.status)}>{p.status}</span>
                                            </div>
                                        )) : (
                                            <div className="px-6 py-8 text-center text-slate-400 text-sm italic">
                                                Tidak ada penjemputan aktif saat ini.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Chart of 6 months */}
                            {monthlyRevenue && monthlyRevenue.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                        Grafik Pendapatan 6 Bulan Terakhir
                                    </h3>
                                    <div className="flex items-end justify-between gap-4 h-48 pt-4">
                                        {monthlyRevenue.map((row, idx) => {
                                            const maxRevenue = Math.max(...monthlyRevenue.map(r => r.revenue), 1);
                                            const heightPercentage = Math.round((row.revenue / maxRevenue) * 100);
                                            return (
                                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                                    <div className="w-full bg-slate-50 hover:bg-emerald-50/30 rounded-xl flex items-end h-32 transition-colors relative">
                                                        {/* Tooltip on hover */}
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10 transition-all duration-200">
                                                            Rp {Number(row.revenue).toLocaleString('id-ID')}
                                                        </div>
                                                        <div
                                                            style={{ height: `${heightPercentage}%` }}
                                                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl group-hover:to-emerald-300 transition-all duration-300 shadow-md shadow-emerald-500/10 min-h-[4px]"
                                                        ></div>
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">{row.month}</p>
                                                    <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 font-mono">Rp {(row.revenue / 1000).toLocaleString('id-ID')}K</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Revenue Summary */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium mb-1">Total Pendapatan Terkonfirmasi</p>
                                        <p className="text-3xl font-black">Rp {Number(stats.total_revenue).toLocaleString('id-ID')}</p>
                                        <p className="text-emerald-200 text-xs mt-1">Dari seluruh pembayaran iuran yang telah berhasil dikonfirmasi</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl">
                                        <Banknote className="h-10 w-10 text-white/80" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ TAB 2: VERIFIKASI PELANGGAN ══════════════ */}
                    {activeTab === 'customers' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau email pelanggan..."
                                        value={searchCustomer}
                                        onChange={e => setSearchCustomer(e.target.value)}
                                        className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-full focus:outline-none focus:border-emerald-500 bg-white"
                                    />
                                </div>
                                <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                                    {filteredCustomers.length} pelanggan
                                </span>
                                <button
                                    onClick={() => { if (customerFormOpen) { resetCustomerForm(); } setCustomerFormOpen(!customerFormOpen); }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" /> {customerFormOpen ? 'Tutup Form' : 'Tambah Pelanggan'}
                                </button>
                            </div>

                            {customerFormOpen && (
                                <form onSubmit={handleCustomerSubmit} className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{editingCustomerId ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}</h3>
                                            <p className="text-xs text-slate-500">Form tampil di halaman ini, tanpa popup.</p>
                                        </div>
                                        {editingCustomerId && <span className="text-xs text-amber-600 font-semibold">Mode edit</span>}
                                    </div>
                                    {customerFormError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">{customerFormError}</div>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <input required placeholder="Nama lengkap" value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                        <input required type="email" placeholder="Email login" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                        <input required={!editingCustomerId} type="password" placeholder={editingCustomerId ? 'Password baru (opsional)' : 'Password minimal 6 karakter'} value={customerForm.password} onChange={e => setCustomerForm({ ...customerForm, password: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                        <input placeholder="Nomor HP" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                        <input type="number" min="1" max="31" placeholder="Tanggal jatuh tempo (1-31)" value={customerForm.payment_due_day} onChange={e => setCustomerForm({ ...customerForm, payment_due_day: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                        <input type="number" min="0" step="1000" placeholder="Jumlah iuran bulanan" value={customerForm.monthly_fee} onChange={e => setCustomerForm({ ...customerForm, monthly_fee: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                        {editingCustomerId && <select value={customerForm.status} onChange={e => setCustomerForm({ ...customerForm, status: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm"><option value="active">Aktif</option><option value="pending">Pending</option><option value="inactive">Nonaktif</option><option value="rejected">Ditolak</option></select>}
                                        <textarea placeholder="Alamat lengkap" value={customerForm.address} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm md:col-span-2 lg:col-span-3" rows={2} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => { resetCustomerForm(); setCustomerFormOpen(false); }} className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl">Batal</button>
                                        <button disabled={customerFormLoading} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl disabled:opacity-50">{customerFormLoading ? 'Menyimpan...' : (editingCustomerId ? 'Simpan Perubahan' : 'Simpan Pelanggan')}</button>
                                    </div>
                                </form>
                            )}

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                         <tr>
                                            {['Pelanggan', 'NIK', 'Alamat', 'Iuran Bulanan', 'Tgl Jatuh Tempo', 'Tanggal Tagihan', 'Status', 'Aksi'].map(h => (
                                                <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                         {filteredCustomers.length > 0 ? filteredCustomers.map((c: any) => {
                                            const cust = c.user ? c : { user: c, nik: c.nik, address: c.address };
                                            const payment = c.latestMonthlyPayment;
                                            const isPendingReg = (cust.user?.status ?? c.status ?? 'pending') === 'pending';
                                            const isRejectedReg = (cust.user?.status ?? c.status ?? 'rejected') === 'rejected';
                                            const isPaid = payment?.status === 'Paid';
                                            const isPendingPayment = payment?.status === 'Pending';
                                            return (
                                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
                                                                {(cust.user?.name ?? c.name ?? 'P').charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{cust.user?.name ?? c.name ?? '-'}</p>
                                                                <p className="text-xs text-slate-400">{cust.user?.email ?? c.email ?? '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{cust.nik ?? '-'}</td>
                                                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cust.address ?? '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1000"
                                                            value={monthlyFeeCache[c.id] ?? Number(c.monthly_fee ?? 50000)}
                                                            onChange={(e) => setMonthlyFeeCache({ ...monthlyFeeCache, [c.id]: Number(e.target.value) })}
                                                            onBlur={() => {
                                                                const val = monthlyFeeCache[c.id] ?? Number(c.monthly_fee ?? 50000);
                                                                if (val !== Number(c.monthly_fee ?? 50000)) handleUpdateMonthlyFee(c.id, val);
                                                                else setMonthlyFeeCache(prev => { const next = { ...prev }; delete next[c.id]; return next; });
                                                            }}
                                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                            disabled={updatingDueDayId === c.id}
                                                            className="w-28 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                                                        />
                                                        <p className="text-[10px] text-slate-400 mt-1">Rp {Number(c.monthly_fee ?? 50000).toLocaleString('id-ID')}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="31"
                                                                value={dueDayCache[c.id] ?? (c.payment_due_day ?? '')}
                                                                onChange={(e) => setDueDayCache({ ...dueDayCache, [c.id]: parseInt(e.target.value) || undefined })}
                                                                onBlur={() => {
                                                                    const val = dueDayCache[c.id] ?? c.payment_due_day;
                                                                    if (val && val !== (c.payment_due_day ?? undefined)) {
                                                                        handleUpdatePaymentDueDay(c.id, val);
                                                                    } else {
                                                                        setDueDayCache(prev => {
                                                                            const next = { ...prev };
                                                                            delete next[c.id];
                                                                            return next;
                                                                        });
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                                disabled={updatingDueDayId === c.id}
                                                                className="w-14 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                                                                placeholder="31"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {payment ? (
                                                            <div className="text-xs">
                                                                <p className="font-semibold text-slate-800">{formatDate(payment.invoice_date || payment.due_date)}</p>
                                                                <p className="text-slate-400">Jatuh tempo: {formatDate(payment.due_date)}</p>
                                                                <span className={statusBadge(payment.status)}>
                                                                    {paymentStatusLabel[payment.status] ?? payment.status}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-xs">Belum ada tagihan</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={statusBadge(cust.user?.status ?? c.status ?? 'pending')}>
                                                            {cust.user?.status ?? c.status ?? 'pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <button
                                                                onClick={() => startEditCustomer(c)}
                                                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCustomer(c)}
                                                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                                                            </button>
                                                            {(isPendingReg || isRejectedReg) ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => setSelectedCustomer(c)}
                                                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                        Detail
                                                                    </button>
                                                                    {isPendingReg && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleApproveCustomer(cust.user?.id ?? c.id)}
                                                                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                                            >
                                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                Setujui
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRejectCustomer(cust.user?.id ?? c.id)}
                                                                                className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                                            >
                                                                                Tolak
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {isRejectedReg && (
                                                                        <span className="text-xs text-red-500 font-semibold italic">Ditolak</span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => setSelectedCustomer(c)}
                                                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                        Detail
                                                                    </button>
                                                                    {isPendingPayment && (
                                                                        <button
                                                                            onClick={() => handlePaymentAction(payment.id, 'approve')}
                                                                            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                                        >
                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                            Setujui Bayar
                                                                        </button>
                                                                    )}
                                                                    {payment && (
                                                                        <button
                                                                            onClick={() => openInvoiceInWindow(`/admin/payments/${payment.id}/invoice?download=1`)}
                                                                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-650 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                                                        >
                                                                            <Printer className="h-3.5 w-3.5" />
                                                                            Cetak PDF
                                                                        </button>
                                                                    )}
                                                                    {!isPendingPayment && !isPaid && (
                                                                        <span className="text-xs text-slate-400 italic">Aktif</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                                                    Tidak ada data pelanggan yang ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ TAB 3: PETUGAS LAPANGAN ══════════════════ */}
                    {activeTab === 'officers' && (
                        <div className="space-y-6">
                            {/* Map View */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-2 relative z-0">
                                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-slate-900">Peta Lokasi Petugas (Real-time)</h3>
                                </div>
                                <MapContainer center={[-8.366022, 114.165939]} zoom={13} style={{ height: '400px', width: '100%', zIndex: 1, borderRadius: '0.75rem' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapController officers={officers} />
                                    {officers.filter(o => o.latitude && o.longitude).map((o: any) => (
                                        <Marker key={o.id} position={[parseFloat(String(o.latitude)), parseFloat(String(o.longitude))]}>
                                            <Popup>
                                                <div className="text-center p-1">
                                                    <strong className="text-sm font-bold text-slate-900">{o.name ?? o.user?.name}</strong><br />
                                                    <span className="text-xs text-slate-600">Wilayah: {o.region ?? '-'}</span><br />
                                                    <span className="text-[11px] text-slate-400 font-mono">[{o.latitude}, {o.longitude}]</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                {/* Officers Table */}
                                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900">Daftar Petugas Lapangan</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Total: {officers.length} petugas terdaftar</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[800px] divide-y divide-slate-100">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {['Petugas', 'NIK', 'Wilayah', 'Status', 'Aksi'].map(h => (
                                                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {officers.length > 0 ? officers.map((o: any) => (
                                                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 text-sm">
                                                                {(o.name ?? o.user?.name ?? 'P').charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{o.name ?? o.user?.name}</p>
                                                                <p className="text-xs text-slate-400">{o.user?.email ?? o.phone}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{o.nik}</td>
                                                    <td className="px-5 py-3.5 text-slate-600">{o.region ?? '-'}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={statusBadge(o.is_active ? 'active' : 'inactive')}>
                                                            {o.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <button
                                                            onClick={() => handleToggleOfficer(o.id)}
                                                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${o.is_active
                                                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                }`}
                                                        >
                                                            {o.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400 italic text-sm">
                                                        Belum ada petugas yang terdaftar.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>

                                {/* Register Officer Form */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                                        <div>
                                            <h3 className="font-bold text-slate-900">Daftarkan Petugas Baru</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">Isi data lengkap petugas lapangan baru</p>
                                        </div>

                                        {officerSuccess && (
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-2 text-xs text-emerald-700">
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                                Petugas berhasil didaftarkan!
                                            </div>
                                        )}
                                        {officerError && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-xs text-red-700">
                                                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                                                {officerError}
                                            </div>
                                        )}

                                        <form onSubmit={handleCreateOfficer} className="space-y-3">
                                            {[
                                                { label: 'Nama Lengkap', key: 'name', type: 'text', placeholder: 'Budi Santoso' },
                                                { label: 'Email Login', key: 'email', type: 'email', placeholder: 'budi@resikapp.com' },
                                                { label: 'Password Awal', key: 'password', type: 'text', placeholder: 'petugas123' },
                                                { label: 'NIK (16 digit)', key: 'nik', type: 'text', placeholder: '32XXXXXXXXXXXXXX' },
                                                { label: 'No. Handphone', key: 'phone', type: 'text', placeholder: '081234567890' },
                                            ].map(field => (
                                                <div key={field.key}>
                                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">{field.label}</label>
                                                    <input
                                                        type={field.type}
                                                        value={(officerForm as any)[field.key]}
                                                        onChange={e => setOfficerForm({ ...officerForm, [field.key]: e.target.value })}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                                        placeholder={field.placeholder}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Alamat</label>
                                                <textarea
                                                    rows={2}
                                                    value={officerForm.address}
                                                    onChange={e => setOfficerForm({ ...officerForm, address: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                                    placeholder="Jl. Contoh No. 1, Genteng, Banyuwangi"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Wilayah Kerja</label>
                                                <select
                                                    value={officerForm.region}
                                                    onChange={e => setOfficerForm({ ...officerForm, region: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option value="">-- Pilih Wilayah Kerja --</option>
                                                    {workRegions.map((r: any) => (
                                                        <option key={r.id} value={r.name}>{r.name} ({r.code})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={officerLoading}
                                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-semibold text-sm transition-colors"
                                            >
                                                {officerLoading ? 'Mendaftarkan...' : 'Daftarkan Petugas'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ TAB 4: PENUGASAN PICKUP ══════════════════ */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-5">
                            {/* Header row */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">Kelola penugasan petugas untuk setiap request penjemputan sampah dari pelanggan.</p>
                                <button
                                    onClick={() => { setShowCreatePickup(v => !v); setCreatePickupError(null); setCreatePickupSuccess(false); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat Penugasan Baru
                                </button>
                            </div>

                            {/* ── Create Pickup Form Panel (slide-down) ── */}
                            {showCreatePickup && (
                                <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                                    <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-emerald-600" />
                                            <span className="font-semibold text-emerald-800 text-sm">Buat Penugasan Pickup Baru</span>
                                        </div>
                                        <button onClick={() => setShowCreatePickup(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleCreatePickup} className="p-6">
                                        {/* Feedback banners */}
                                        {createPickupSuccess && (
                                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-2 text-xs text-emerald-700">
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                                Penugasan pickup berhasil dibuat! Form akan tertutup otomatis.
                                            </div>
                                        )}
                                        {createPickupError && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-xs text-red-700">
                                                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                                                {createPickupError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Pilih Pelanggan */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                    Pilih Pelanggan <span className="text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={createPickupForm.customer_id}
                                                        onChange={e => setCreatePickupForm({ ...createPickupForm, customer_id: e.target.value })}
                                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 appearance-none bg-white"
                                                        required
                                                    >
                                                        <option value="">-- Pilih pelanggan --</option>
                                                        {customers.map((c: any) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.user?.name ?? c.name} {c.user?.email ? `(${c.user.email})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Tanggal */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                    Tanggal Penjemputan <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={createPickupForm.date}
                                                    onChange={e => setCreatePickupForm({ ...createPickupForm, date: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>

                                            {/* Waktu */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                    Waktu Penjemputan <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="time"
                                                    value={createPickupForm.time}
                                                    onChange={e => setCreatePickupForm({ ...createPickupForm, time: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                                    required
                                                />
                                            </div>

                                            {/* Jenis Sampah */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                    Jenis Sampah <span className="text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={createPickupForm.waste_type}
                                                        onChange={e => setCreatePickupForm({ ...createPickupForm, waste_type: e.target.value })}
                                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 appearance-none bg-white capitalize"
                                                        required
                                                    >
                                                        {['organik', 'anorganik', 'campuran', 'b3'].map(t => (
                                                            <option key={t} value={t} className="capitalize">{t}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Estimasi Berat */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                    Estimasi Berat (kg) <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={createPickupForm.estimated_weight}
                                                    onChange={e => setCreatePickupForm({ ...createPickupForm, estimated_weight: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                                    required
                                                />
                                            </div>

                                            {/* Pilih Petugas (opsional) */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                    Tugaskan ke Petugas <span className="text-slate-400 font-normal normal-case">(opsional — bisa ditugaskan nanti)</span>
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={createPickupForm.officer_id}
                                                        onChange={e => setCreatePickupForm({ ...createPickupForm, officer_id: e.target.value })}
                                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 appearance-none bg-white"
                                                    >
                                                        <option value="">-- Belum ditugaskan --</option>
                                                        {officers.map((o: any) => (
                                                            <option key={o.id} value={o.id}>{o.name ?? o.user?.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Catatan */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                    Catatan <span className="text-slate-400 font-normal normal-case">(opsional)</span>
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={createPickupForm.notes}
                                                    onChange={e => setCreatePickupForm({ ...createPickupForm, notes: e.target.value })}
                                                    placeholder="Keterangan tambahan untuk petugas..."
                                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreatePickup(false)}
                                                className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={createPickupLoading}
                                                className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-semibold rounded-xl transition-colors"
                                            >
                                                {createPickupLoading
                                                    ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Menyimpan...</>
                                                    : <><Truck className="h-3.5 w-3.5" /> Buat &amp; Tugaskan</>
                                                }
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ── Daftar Penugasan ── */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {['Pelanggan', 'Jadwal', 'Jenis Sampah', 'Berat', 'Status', 'Petugas', 'Aksi'].map(h => (
                                                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {pickups.length > 0 ? pickups.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-4 font-medium text-slate-800">
                                                    {p.customer?.user?.name ?? p.customer?.name ?? 'Pelanggan'}
                                                </td>
                                                <td className="px-5 py-4 text-slate-500 text-xs">{p.date} {p.time}</td>
                                                <td className="px-5 py-4 capitalize text-slate-600">{p.waste_type}</td>
                                                <td className="px-5 py-4 text-slate-600">{p.estimated_weight} kg</td>
                                                <td className="px-5 py-4"><span className={statusBadge(p.status)}>{p.status}</span></td>
                                                <td className="px-5 py-4 text-slate-500 text-xs">
                                                    {p.officer?.name ?? <span className="italic text-amber-500">Belum ditugaskan</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {assigningId === p.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <select
                                                                    value={selectedOfficerId}
                                                                    onChange={e => setSelectedOfficerId(e.target.value)}
                                                                    className="pl-2 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 appearance-none"
                                                                >
                                                                    <option value="">Pilih petugas...</option>
                                                                    {officers.map((o: any) => (
                                                                        <option key={o.id} value={o.id}>{o.name ?? o.user?.name}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                                                            </div>
                                                            <button
                                                                onClick={() => handleAssignPickup(p.id)}
                                                                disabled={!selectedOfficerId || assignLoading}
                                                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-xs font-semibold rounded-lg transition-colors"
                                                            >
                                                                {assignLoading ? '...' : 'Simpan'}
                                                            </button>
                                                            <button
                                                                onClick={() => { setAssigningId(null); setSelectedOfficerId(''); }}
                                                                className="px-2.5 py-1.5 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50"
                                                            >
                                                                Batal
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setAssigningId(p.id)}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${p.officer_id
                                                                ? 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                                                                : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                                        >
                                                            {p.officer_id ? 'Ganti Petugas' : 'Tugaskan'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic text-sm">
                                                    Tidak ada request penjemputan aktif saat ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ TAB 5: VERIFIKASI PEMBAYARAN ════════════ */}
                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama pelanggan..."
                                        value={searchPayment}
                                        onChange={e => setSearchPayment(e.target.value)}
                                        className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-full focus:outline-none focus:border-emerald-500 bg-white"
                                    />
                                </div>
                                <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                                    {filteredPayments.length} tagihan
                                </span>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {['Pelanggan', 'Periode', 'Jumlah', 'Metode', 'Status', 'Bukti', 'Aksi'].map(h => (
                                                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {filteredPayments.length > 0 ? filteredPayments.map((pay: any) => (
                                            <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-4 font-medium text-slate-800">
                                                    {pay.customer?.user?.name ?? pay.customer?.name ?? '-'}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">Bulan {pay.month}/{pay.year}</td>
                                                <td className="px-5 py-4 font-bold text-slate-900">
                                                    Rp {Number(pay.amount).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-5 py-4 text-slate-500 text-xs">{pay.payment_method ? typeLabel(pay.payment_method) : '-'}</td>
                                                <td className="px-5 py-4"><span className={statusBadge(pay.status)}>{pay.status === 'Paid' && pay.payment_method === 'cash' ? 'Bayar Cash' : pay.status}</span></td>
                                                <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                                                    {pay.proof_path ? (
                                                        <button
                                                            onClick={() => setSelectedProofUrl(pay.proof_path)}
                                                            className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold flex items-center gap-1"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            Lihat Bukti
                                                        </button>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {confirmingPaymentId === pay.id ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => handlePaymentAction(pay.id, 'approve')}
                                                                disabled={paymentActionLoading}
                                                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                                            >
                                                                ✓ Terima
                                                            </button>
                                                            <button
                                                                onClick={() => handlePaymentAction(pay.id, 'reject')}
                                                                disabled={paymentActionLoading}
                                                                className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                                            >
                                                                ✗ Tolak
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmingPaymentId(null)}
                                                                className="px-2.5 py-1.5 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50"
                                                            >
                                                                Batal
                                                            </button>
                                                        </div>
                                                    ) : pay.status === 'Pending' || pay.status === 'Unpaid' ? (
                                                        <button
                                                            onClick={() => setConfirmingPaymentId(pay.id)}
                                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                                        >
                                                            Verifikasi
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openInvoiceInWindow(`/admin/payments/${pay.id}/invoice?download=1`)}
                                                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-650 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <Printer className="h-3.5 w-3.5" />
                                                            Print / Save PDF
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic text-sm">
                                                    Tidak ada data pembayaran yang ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ TAB 6: METODE PEMBAYARAN ══════════════ */}
                    {activeTab === 'payment_methods' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-800">Metode Pembayaran</h2>
                                <button
                                    onClick={() => openPaymentMethodModal()}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" /> Tambah Metode
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] divide-y divide-slate-100">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {['Metode', 'Tipe', 'Detail', 'Status', 'Aksi'].map(h => (
                                                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {paymentMethods.length > 0 ? paymentMethods.map((m) => (
                                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 py-4 font-medium text-slate-800">{m.name}</td>
                                                    <td className="px-5 py-4 text-slate-600">{typeLabel(m.type)}</td>
                                                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                                                        {m.type === 'bank_transfer' && (
                                                            <span>{m.bank_name} • {m.account_number} • {m.account_holder}</span>
                                                        )}
                                                        {m.type === 'qris' && m.image_path && (
                                                            <img src={m.image_path} alt="QRIS" className="w-10 h-10 object-contain" />
                                                        )}
                                                        {m.type === 'cash' && <span>Tunai langsung ke petugas</span>}
                                                        {m.type === 'virtual_account' && (
                                                            <span>{m.bank_name} • {m.account_number}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <button
                                                            onClick={() => togglePaymentMethod(m)}
                                                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                                                        >
                                                            {m.is_active ? 'Aktif' : 'Non-aktif'}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => openPaymentMethodModal(m)}
                                                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePaymentMethod(m.id, m.name)}
                                                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 italic text-sm">
                                                        Belum ada metode pembayaran yang dikonfigurasi.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ TAB 6: CMS & SETTINGS ══════════════════ */}
                    {activeTab === 'cms' && (
                        <div className="space-y-6 animate-fade-in bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex border-b border-slate-200 gap-6 mb-6">
                                <button
                                    onClick={() => setCmsSubTab('news')}
                                    className={`pb-3 text-sm font-semibold border-b-2 transition-all ${cmsSubTab === 'news' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
                                >
                                    Artikel Berita ({news.length})
                                </button>
                                <button
                                    onClick={() => setCmsSubTab('profile')}
                                    className={`pb-3 text-sm font-semibold border-b-2 transition-all ${cmsSubTab === 'profile' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-650'}`}
                                >
                                    Profil & Info Aplikasi
                                </button>
                            </div>

                            {cmsSubTab === 'news' ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <h3 className="font-bold text-slate-700 text-sm">Semua Daftar Berita</h3>
                                        <button
                                            onClick={() => navigate('/admin/news/create')}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4" /> Tambah Berita Baru
                                        </button>
                                    </div>

                                    {/* Table of news */}
                                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[800px] divide-y divide-slate-150 text-xs">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Judul & Ilustrasi</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Penulis</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pembaca</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Rilis</th>
                                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tindakan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
                                                {news.length > 0 ? (
                                                    news.map(item => (
                                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4 flex items-center gap-3">
                                                                <div className="h-10 w-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                                                    <img
                                                                        src={item.image || 'https://images.unsplash.com/photo-1595275372274-1216652e008d?auto=format&fit=crop&w=150&q=80'}
                                                                        alt={item.title}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595275372274-1216652e008d?auto=format&fit=crop&w=150&q=80';
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-xs leading-normal max-w-xs">{item.title}</p>
                                                                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{item.slug}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 font-semibold text-slate-600">{item.author?.name || 'Admin'}</td>
                                                            <td className="px-6 py-4 font-mono font-bold text-emerald-605">{item.views} views</td>
                                                            <td className="px-6 py-4 font-medium text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                                                            <td className="px-6 py-4 space-x-1.5 whitespace-nowrap">
                                                                <button
                                                                    onClick={() => navigate('/admin/news/edit/' + item.id)}
                                                                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                                                                    title="Edit Artikel"
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteNews(item.id)}
                                                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer"
                                                                    title="Hapus Artikel"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Belum ada artikel berita tersimpan.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2 max-w-2xl space-y-6">
                                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                        <Globe className="h-5 w-5 text-emerald-600" /> Profil Instansi {company.name}
                                    </h3>
                                    {settingsSuccess && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-2 text-xs text-emerald-700">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                            Pengaturan berhasil disimpan!
                                        </div>
                                    )}
                                    {settingsError && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-xs text-red-700">
                                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                                            {settingsError}
                                        </div>
                                    )}
                                    <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 pb-4 mb-2">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Logo Aplikasi</label>
                                                <input
                                                    type="file"
                                                    accept=".ico,.png,.jpg,.jpeg,.svg,.webp,image/*"
                                                    onChange={e => setSettingsLogo(e.target.files?.[0] || null)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah</p>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Favicon (Ikon Tab)</label>
                                                <input
                                                    type="file"
                                                    accept=".ico,.png,.jpg,.jpeg,.svg,.webp,image/*"
                                                    onChange={e => setSettingsFavicon(e.target.files?.[0] || null)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Gunakan format .png / .ico</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nama Instansi / Website</label>
                                                <input
                                                    type="text"
                                                    value={settings.name}
                                                    onChange={e => setSettings({ ...settings, name: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Surel Kontak (Email)</label>
                                                <input
                                                    type="email"
                                                    value={settings.email}
                                                    onChange={e => setSettings({ ...settings, email: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs"
                                                    placeholder="info@contoh.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nomor Telepon Kantor</label>
                                                <input
                                                    type="text"
                                                    value={settings.phone}
                                                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs"
                                                    placeholder="021-12345678"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Alamat Kantor Pusat</label>
                                                <input
                                                    type="text"
                                                    value={settings.address}
                                                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs"
                                                    placeholder="Jl. Contoh No. 1, Kota"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Sejarah Singkat Organisasi</label>
                                            <textarea
                                                value={settings.history}
                                                rows={3}
                                                onChange={e => setSettings({ ...settings, history: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Visi Perusahaan</label>
                                                <textarea
                                                    value={settings.vision}
                                                    rows={3}
                                                    onChange={e => setSettings({ ...settings, vision: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Misi Perusahaan</label>
                                                <textarea
                                                    value={settings.mission}
                                                    rows={3}
                                                    onChange={e => setSettings({ ...settings, mission: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={settingsLoading}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer transition-colors"
                                        >
                                            {settingsLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ TAB 7: WILAYAH KERJA ══════════════════ */}
                    {activeTab === 'regions' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-emerald-600" />
                                            Manajemen Wilayah Kerja (Zonasi Layanan)
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Kelola zonasi area operasional penjemputan sampah dan alokasi beban kerja petugas.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingWorkRegion(null);
                                            setWorkRegionForm({ name: '', code: '', description: '', is_active: true });
                                            setShowWorkRegionModal(true);
                                        }}
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                                    >
                                        <Plus className="h-4 w-4" /> Tambah Wilayah Kerja
                                    </button>
                                </div>

                                {/* Filter Search */}
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari wilayah kerja berdasarkan nama atau kode..."
                                            value={searchRegion}
                                            onChange={e => setSearchRegion(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 bg-slate-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Regions Table */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] divide-y divide-slate-100">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                {['Kode Wilayah', 'Nama Wilayah Kerja', 'Cakupan Area / Deskripsi', 'Jumlah Petugas', 'Status', 'Aksi'].map(h => (
                                                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {workRegions.filter(r =>
                                                r.name.toLowerCase().includes(searchRegion.toLowerCase()) ||
                                                r.code.toLowerCase().includes(searchRegion.toLowerCase())
                                            ).length > 0 ? (
                                                workRegions
                                                    .filter(r =>
                                                        r.name.toLowerCase().includes(searchRegion.toLowerCase()) ||
                                                        r.code.toLowerCase().includes(searchRegion.toLowerCase())
                                                    )
                                                    .map((r) => (
                                                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                                                                    {r.code}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-slate-800">{r.name}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-slate-500 max-w-sm">
                                                                {r.description || <span className="italic text-slate-300">Tidak ada deskripsi</span>}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                                                                    <Truck className="h-3.5 w-3.5 text-slate-500" />
                                                                    {r.officers_count ?? 0} Petugas
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={statusBadge(r.is_active ? 'active' : 'inactive')}>
                                                                    {r.is_active ? 'Aktif' : 'Nonaktif'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingWorkRegion(r);
                                                                            setWorkRegionForm({
                                                                                name: r.name,
                                                                                code: r.code,
                                                                                description: r.description || '',
                                                                                is_active: r.is_active,
                                                                            });
                                                                            setShowWorkRegionModal(true);
                                                                        }}
                                                                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                                                                        title="Edit Wilayah"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleToggleWorkRegion(r.id)}
                                                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                                                            r.is_active
                                                                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                        }`}
                                                                    >
                                                                        {r.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteWorkRegion(r.id, r.name)}
                                                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                                                                        title="Hapus Wilayah"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                                        Tidak ada data wilayah kerja. Klik "+ Tambah Wilayah Kerja" untuk membuat baru.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ═══ MODAL WORK REGION (TAMBAH / EDIT) ══════════════════ */}
            {showWorkRegionModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 border border-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                                {editingWorkRegion ? 'Edit Wilayah Kerja' : 'Tambah Wilayah Kerja Baru'}
                            </h3>
                            <button
                                onClick={() => setShowWorkRegionModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveWorkRegion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nama Wilayah Kerja</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Genteng, Banyuwangi Kota, Giri"
                                    value={workRegionForm.name}
                                    onChange={e => setWorkRegionForm({ ...workRegionForm, name: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Kode Wilayah</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: W-GNT, W-BWI, W-GRI"
                                    value={workRegionForm.code}
                                    onChange={e => setWorkRegionForm({ ...workRegionForm, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Deskripsi / Cakupan Area</label>
                                <textarea
                                    rows={3}
                                    placeholder="Detail kelurahan atau daerah cakupan operasional..."
                                    value={workRegionForm.description}
                                    onChange={e => setWorkRegionForm({ ...workRegionForm, description: e.target.value })}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="work_region_active"
                                    checked={workRegionForm.is_active}
                                    onChange={e => setWorkRegionForm({ ...workRegionForm, is_active: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="work_region_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Aktifkan Wilayah Kerja Ini
                                </label>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowWorkRegionModal(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={workRegionLoading}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                                >
                                    {workRegionLoading ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Pelanggan */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 transition-all duration-300">
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-emerald-600" />
                                Detail Pelanggan
                            </h3>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-800 text-2xl shrink-0">
                                    {(selectedCustomer.user?.name ?? selectedCustomer.name ?? 'P').charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-lg">{selectedCustomer.user?.name ?? selectedCustomer.name ?? '-'}</h4>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                                        {(selectedCustomer.customer_type ?? 'rumah_tangga').replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">NIK</p>
                                    <p className="font-medium text-slate-700 font-mono mt-0.5">{selectedCustomer.nik ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. Telepon</p>
                                    <p className="font-medium text-slate-700 mt-0.5">{selectedCustomer.phone ?? '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                    <p className="font-medium text-slate-700 mt-0.5">{selectedCustomer.user?.email ?? selectedCustomer.email ?? '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat Lengkap</p>
                                    <p className="font-medium text-slate-700 mt-0.5">{selectedCustomer.address ?? '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Jatuh Tempo Bulanan</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={dueDayCache[selectedCustomer.id] ?? (selectedCustomer.payment_due_day ?? '')}
                                            onChange={(e) => setDueDayCache({ ...dueDayCache, [selectedCustomer.id]: parseInt(e.target.value) || undefined })}
                                            onBlur={() => {
                                                const val = dueDayCache[selectedCustomer.id] ?? selectedCustomer.payment_due_day;
                                                if (val && val !== (selectedCustomer.payment_due_day ?? undefined)) {
                                                    handleUpdatePaymentDueDay(selectedCustomer.id, val);
                                                }
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                            disabled={updatingDueDayId === selectedCustomer.id}
                                            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                                            placeholder="31"
                                        />
                                        <span className="text-xs text-slate-400">
                                            {selectedCustomer.payment_due_day ? `Setiap tanggal ${selectedCustomer.payment_due_day} setiap bulumnya` : 'Belum diatur (default: akhir bulan)'}
                                        </span>
                                    </div>
                                </div>
                                {selectedCustomer.latitude && selectedCustomer.longitude && (
                                    <div className="col-span-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Koordinat Rumah (GPS)</p>
                                        <p className="font-medium text-slate-700 font-mono mt-0.5">
                                            {selectedCustomer.latitude}, {selectedCustomer.longitude}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* House Photo */}
                            {selectedCustomer.house_photo && (
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Foto Rumah</p>
                                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center">
                                        <img
                                            src={selectedCustomer.house_photo.startsWith('http') ? selectedCustomer.house_photo : `${getApiBaseUrl()}/storage/${selectedCustomer.house_photo}`}
                                            alt="Foto Rumah"
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Tutup
                            </button>
                            {(selectedCustomer.user?.status === 'pending' || selectedCustomer.status === 'pending') && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleRejectCustomer(selectedCustomer.user?.id ?? selectedCustomer.id);
                                            setSelectedCustomer(null);
                                        }}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleApproveCustomer(selectedCustomer.user?.id ?? selectedCustomer.id);
                                            setSelectedCustomer(null);
                                        }}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors"
                                    >
                                        Setujui
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Metode Pembayaran */}
            {showPaymentMethodModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-emerald-600" />
                                {editingPaymentMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
                            </h3>
                            <button
                                onClick={closePaymentMethodModal}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSavePaymentMethod}>
                            <div className="px-6 py-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Metode</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={paymentMethodForm.name}
                                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipe</label>
                                    <select
                                        value={paymentMethodForm.type}
                                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="bank_transfer">Transfer Bank</option>
                                        <option value="qris">QRIS</option>
                                        <option value="cash">Tunai (Cash)</option>
                                        <option value="virtual_account">Virtual Account</option>
                                    </select>
                                </div>
                                {paymentMethodForm.type === 'bank_transfer' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bank</label>
                                            <input type="text" name="bank_name" value={paymentMethodForm.bank_name} onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, bank_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Rekening</label>
                                            <input type="text" name="account_number" value={paymentMethodForm.account_number} onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, account_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Pemilik Rekening</label>
                                            <input type="text" name="account_holder" value={paymentMethodForm.account_holder} onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, account_holder: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                                        </div>
                                    </div>
                                )}
                                {paymentMethodForm.type === 'virtual_account' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bank</label>
                                            <input type="text" name="bank_name" value={paymentMethodForm.bank_name} onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, bank_name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Rekening</label>
                                            <input type="text" name="account_number" value={paymentMethodForm.account_number} onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, account_number: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" />
                                        </div>
                                    </div>
                                )}
                                {paymentMethodForm.type === 'qris' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">URL / Path Gambar QRIS Statis</label>
                                        <input
                                            type="text"
                                            name="image_path"
                                            value={paymentMethodForm.image_path}
                                            onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, image_path: e.target.value })}
                                            placeholder="/storage/images/qris.png atau https://..."
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi / Instruksi</label>
                                    <textarea
                                        name="description"
                                        value={paymentMethodForm.description}
                                        onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, description: e.target.value })}
                                        rows={2}
                                        placeholder="Instruksi tambahan untuk pelanggan"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closePaymentMethodModal}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentMethodLoading}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                                >
                                    {paymentMethodLoading ? 'Menyimpan...' : (editingPaymentMethod ? 'Perbarui' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Preview Bukti Pembayaran */}
            {selectedProofUrl && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 duration-300">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                                Bukti Pembayaran
                            </h3>
                            <button
                                onClick={() => setSelectedProofUrl(null)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 flex flex-col items-center gap-4">
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-full max-h-[60vh] flex items-center justify-center">
                                <img
                                    src={selectedProofUrl.startsWith('http') ? selectedProofUrl : `${getApiBaseUrl()}/storage/${selectedProofUrl}`}
                                    alt="Bukti Transfer / Pembayaran"
                                    className="object-contain max-h-[50vh]"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedProofUrl(null)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                            >
                                Tutup Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah/Edit Berita */}
            {isNewsModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 transition-all duration-300">
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                <FileText className="h-5 w-5 text-emerald-600 animate-bounce" />
                                {editNewsItem ? 'Sunting Artikel Berita' : 'Tulis Artikel Berita Baru'}
                            </h3>
                            <button
                                onClick={() => { setIsNewsModalOpen(false); setEditNewsItem(null); }}
                                className="p-2 text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleNewsSubmit}>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs font-semibold">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Judul Berita</label>
                                    <input
                                        type="text"
                                        value={newsForm.title}
                                        onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                                        placeholder="Ketik judul artikel berita yang memikat..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-xs"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-450 mt-1 font-mono italic font-normal">
                                        Slug Preview: news/{newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ilustrasi Cover Image URL (Opsional)</label>
                                    <input
                                        type="text"
                                        value={newsForm.image}
                                        onChange={e => setNewsForm({ ...newsForm, image: e.target.value })}
                                        placeholder="https://images.unsplash.com/your-photo-url-here"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ringkasan Singkat (Summary)</label>
                                    <textarea
                                        value={newsForm.summary}
                                        onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })}
                                        placeholder="Tulis ringkasan singkat dalam 1-2 kalimat untuk deskripsi kartu..."
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Konten Narasi Lengkap</label>
                                    <textarea
                                        value={newsForm.content}
                                        onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                                        placeholder="Tulis isi berita seluas mungkin di sini..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xs focus:outline-none"
                                        rows={8}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                                <button
                                    type="button"
                                    onClick={() => { setIsNewsModalOpen(false); setEditNewsItem(null); }}
                                    className="px-4 py-2.5 border border-slate-200 text-slate-650 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                                >
                                    {editNewsItem ? 'Sunting Berita' : 'Terbitkan Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
