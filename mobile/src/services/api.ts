import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Injecter le token JWT dans chaque requête
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── AUTH ──────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    first_name: string; last_name: string;
    phone: string; password: string; commune_id?: string;
  }) => api.post('/auth/register', data),

  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    api.post('/auth/verify-otp', { phone, otp }),

  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }),

  me: () => api.get('/auth/me'),

  updateProfile: (data: Partial<{ first_name: string; last_name: string; email: string; commune_id: string }>) =>
    api.put('/auth/profile', data),

  updateFcmToken: (fcm_token: string) =>
    api.put('/auth/fcm-token', { fcm_token }),
};

// ── COMMUNES ──────────────────────────────────────────────
export const communesApi = {
  search: (q: string) => api.get('/communes/search', { params: { q } }),
  getAll: () => api.get('/communes'),
};

// ── REPORTS ───────────────────────────────────────────────
export const reportsApi = {
  create: (formData: FormData) =>
    api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  myReports: () => api.get('/reports/my'),
  getById:   (id: string) => api.get(`/reports/${id}`),
};

// ── TICKETS ───────────────────────────────────────────────
export const ticketsApi = {
  myTickets:    () => api.get('/tickets/my'),
  getById:      (id: string) => api.get(`/tickets/${id}`),
  getMessages:  (id: string) => api.get(`/tickets/${id}/messages`),
  sendMessage:  (id: string, message: string) =>
    api.post(`/tickets/${id}/messages`, { message }),
};

// ── NOTIFICATIONS ─────────────────────────────────────────
export const notificationsApi = {
  getAll:      () => api.get('/notifications'),
  markRead:    (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
