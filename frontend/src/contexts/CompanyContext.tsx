import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface CompanyData {
    name: string;
    history: string;
    vision: string;
    mission: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
}

interface CompanyContextType {
    company: CompanyData;
    refreshCompany: () => Promise<void>;
}

const defaultCompany: CompanyData = {
    name: 'SI-SAMPAH',
    history: '',
    vision: '',
    mission: '',
    address: '',
    phone: '',
    email: '',
};

const CompanyContext = createContext<CompanyContextType>({
    company: defaultCompany,
    refreshCompany: async () => { },
});

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [company, setCompany] = useState<CompanyData>(defaultCompany);

    const refreshCompany = useCallback(async () => {
        try {
            const res = await api.get('/company-profile');
            if (res.data.success && res.data.data) {
                setCompany(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch company profile:', err);
        }
    }, []);

    useEffect(() => {
        refreshCompany();
    }, [refreshCompany]);

    return (
        <CompanyContext.Provider value={{ company, refreshCompany }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => useContext(CompanyContext);
