import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await api.get('/me');
            if (res.data.success) {
                setUser(res.data.data);
                localStorage.setItem('user', JSON.stringify(res.data.data));
            }
        } catch (err) {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
                // Verify token in background
                await refreshUser();
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const res = await api.post('/login', { email, password });
            if (res.data.success) {
                const { token, user: loggedUser } = res.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(loggedUser));
                setUser(loggedUser);
            }
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: any) => {
        setLoading(true);
        try {
            await api.post('/register', data);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
