import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getApiBaseUrl } from '../services/api';

interface CompanyData {
    name: string;
    history: string;
    vision: string;
    mission: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    favicon?: string;
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
                const companyData = res.data.data;
                setCompany(companyData);

                if (companyData.favicon) {
                    const baseUrl = getApiBaseUrl();
                    const iconUrl = companyData.favicon.startsWith('http')
                        ? companyData.favicon
                        : `${baseUrl}${companyData.favicon}`;
                    const fullHref = `${iconUrl}?v=${Date.now()}`;

                    document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

                    const newLink = document.createElement('link');
                    newLink.rel = 'icon';
                    newLink.href = fullHref;
                    document.head.appendChild(newLink);

                    const shortcutLink = document.createElement('link');
                    shortcutLink.rel = 'shortcut icon';
                    shortcutLink.href = fullHref;
                    document.head.appendChild(shortcutLink);
                }
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
