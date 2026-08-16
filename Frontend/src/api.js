import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const auth = {
    signup: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    updatePassword: (data) => api.put('/auth/update-password', data),
};

export const admin = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params = {}) => api.get('/admin/users', { params }),
    createUser: (data) => api.post('/admin/users', data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getStores: (params = {}) => api.get('/admin/stores', { params }),
    createStore: (data) => api.post('/admin/stores', data),
    deleteStore: (id) => api.delete(`/admin/stores/${id}`),
    updateStoreOwner: (id, ownerId) => api.put(`/admin/stores/${id}/owner`, { ownerId }),
};

export const stores = {
    getAll: () => api.get('/stores'),
    search: (params = {}) => api.get('/stores/search', { params }),
    submitRating: (data) => api.post('/stores/ratings', data),
    getRating: (storeId) => api.get(`/stores/ratings/${storeId}`),
};

export const owner = {
    getDashboard: () => api.get('/owner/dashboard'),
    getStoreRatings: (storeId) => api.get(`/owner/store/${storeId}/ratings`),
};

export const getStores = (params = {}) => stores.search(params);
export const submitRating = (storeId, rating) => stores.submitRating({ storeId, rating });

export default api;