import axios from 'axios';
import { getClientAuthToken } from '../lib/auth-cookies';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getClientAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => Promise.reject(error));

export default api;
