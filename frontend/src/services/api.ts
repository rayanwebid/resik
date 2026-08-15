import axios from 'axios';

export const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://${window.location.hostname}:8000`;
    }
    return `${window.location.protocol}//${window.location.host}`;
};

const api = axios.create({
    baseURL: `${getApiBaseUrl()}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach bearer token automatically if present
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: handle auth expiration globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // If we are on dashboard or protected routes, redirect to login
            if (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/petugas') || window.location.pathname.startsWith('/admin')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
