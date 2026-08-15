export interface Role {
    id: number;
    name: string;
    slug: 'super-admin' | 'petugas' | 'pelanggan';
    description?: string;
}

export interface User {
    id: number;
    role_id: number;
    name: string;
    email: string;
    status: 'pending' | 'active' | 'inactive';
    role?: Role;
    customer?: Customer;
    officer?: Officer;
}

export interface Province {
    id: number;
    name: string;
}

export interface City {
    id: number;
    province_id: number;
    name: string;
}

export interface District {
    id: number;
    city_id: number;
    name: string;
}

export interface Village {
    id: number;
    district_id: number;
    name: string;
    postal_code?: string;
}

export interface Customer {
    id: number;
    user_id: number;
    name: string;
    phone: string;
    address: string;
    province_id?: number;
    city_id?: number;
    district_id?: number;
    village_id?: number;
    province?: Province;
    city?: City;
    district?: District;
    village?: Village;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    house_photo?: string;
    customer_type: 'rumah_tangga' | 'komersial' | 'organik' | 'anorganik';
    user?: User;
}

export interface Officer {
    id: number;
    user_id: number;
    name: string;
    nik: string;
    phone: string;
    address: string;
    photo?: string;
    region?: string;
    schedule?: string[];
    is_active: boolean;
    latitude?: number;
    longitude?: number;
}

export interface PickupRequest {
    id: number;
    customer_id: number;
    officer_id?: number;
    date: string;
    time: string;
    waste_type: string;
    estimated_weight: number;
    notes?: string;
    photo?: string;
    latitude?: number;
    longitude?: number;
    status: 'menunggu' | 'diproses' | 'dalam perjalanan' | 'sudah diambil' | 'selesai' | 'batal';
    customer?: Customer;
    officer?: Officer;
}

export interface PickupHistory {
    id: number;
    pickup_request_id: number;
    date: string;
    officer_id: number;
    weight: number;
    cost: number;
    status: string;
    photo_before?: string;
    photo_after?: string;
    invoice_no?: string;
}

export interface Payment {
    id: number;
    customer_id: number;
    invoice_number?: string;
    amount: number;
    month: number;
    year: number;
    status: 'Unpaid' | 'Paid' | 'Failed' | 'Cancelled' | 'Jatuh Tempo' | 'Pending';
    payment_method?: string;
    proof_path?: string;
    payment_date?: string;
    due_date?: string;
    invoice_date?: string;
    paid_at?: string;
    customer?: Customer;
}

export interface PaymentMethod {
    id: number;
    name: string;
    type: 'bank_transfer' | 'qris' | 'cash' | 'virtual_account';
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    image_path?: string;
    description?: string;
    order?: number;
    is_active: boolean;
}

export interface WorkRegion {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    officers_count?: number;
    created_at?: string;
    updated_at?: string;
}

