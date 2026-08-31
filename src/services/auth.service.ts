import api from './api';
import { User } from '../types/jatra';

export const authService = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
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
    const response = await api.post('/auth/logout');
    return response.data;
  },
  forgetPassword: async (data: { email: string }) => {
    const response = await api.post('/auth/forget-password', data);
    return response.data;
  },
  resetPassword: async (data: { email: string, otp: string, newPassword: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  changePassword: async (data: { oldPassword: string, newPassword: string }) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  }
};
