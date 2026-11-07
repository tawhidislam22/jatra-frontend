import api from './api';
import { User } from '../types/jatra';
import { setClientAuthToken, clearClientAuthToken } from '../lib/auth-cookies';

export const authService = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    const token = response.data?.data?.accessToken || response.data?.accessToken || response.data?.token;
    if (token) {
      setClientAuthToken(token);
    }
    return response.data;
  },
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    const token = response.data?.data?.accessToken || response.data?.accessToken || response.data?.token;
    if (token) {
      setClientAuthToken(token);
    }
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  verifyEmail: async (data: any) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },
  resendOTP: async (data: { email: string }) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      clearClientAuthToken();
    }
  },
  forgetPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forget-password', data);
    return response.data;
  },
  resetPassword: async (data: { email: string, otp: string, newPassword: string }) => {
    const response = await api.post('/auth/reset-password', data);
    const token = response.data?.data?.accessToken || response.data?.accessToken || response.data?.token;
    if (token) {
      setClientAuthToken(token);
    }
    return response.data;
  },
  changePassword: async (data: { oldPassword: string, newPassword: string }) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    const token = response.data?.data?.accessToken || response.data?.accessToken || response.data?.token;
    if (token) {
      setClientAuthToken(token);
    }
    return response.data;
  },
  setupPassword: async (data: { email: string, temporaryPassword?: string, newPassword: string }) => {
    const response = await api.post('/auth/setup-password', data);
    const token = response.data?.data?.accessToken || response.data?.accessToken || response.data?.token;
    if (token) {
      setClientAuthToken(token);
    }
    return response.data;
  }
};
