import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:12345/api', // Fallback if env var is missing
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
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

// Response interceptor (optional, but good for global error handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Handle unauthorized access (e.g., redirect to login)
            // For now, we just let the component handle it or the Auth context
            console.warn('Unauthorized access. Token might be invalid or expired.');
            // Optional: localStorage.clear(); window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
