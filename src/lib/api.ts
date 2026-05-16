import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data: any) => api.post('/register', data),
  login: (data: any) => api.post('/login', data),
};

export const notes = {
  getAll: (params?: any) => api.get('/notes', { params }),
  getById: (id: string) => api.get(`/notes/${id}`),
  create: (data: any) => api.post('/notes', data),
  update: (id: string, data: any) => api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  share: (id: string, data: any) => api.post(`/notes/${id}/share`, data),
  search: (params?: any) => api.get('/search', { params }),
  lock: (id: string, data: { password: string }) => api.post(`/notes/${id}/lock`, data),
  unlock: (id: string, data: { password: string }) => api.post(`/notes/${id}/unlock`, data),
  verifyLock: (id: string, data: { password: string }) => api.post(`/notes/${id}/verify-lock`, data),
};

export default api;
