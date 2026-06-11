import axios from 'axios';
import { useAuthStore } from '../store/authStore';

let baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
if (baseUrl.startsWith('http') && !baseUrl.endsWith('/api/v1')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api/v1';
}

const api = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
