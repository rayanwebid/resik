import axios from 'axios';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:8000/api`,
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
