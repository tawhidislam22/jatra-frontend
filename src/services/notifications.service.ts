import api from './api';
import { Notification } from '@/types/jatra';

export const notificationsService = {
  getNotifications: async (filter?: 'all' | 'unread' | 'read'): Promise<{
    notifications: Notification[];
    unreadCount: number;
  }> => {
    const query = filter && filter !== 'all' ? `?filter=${filter}` : '';
    const response = await api.get(`/notifications${query}`);
    return response.data?.data || { notifications: [], unreadCount: 0 };
  },

  markAsRead: async (id: string): Promise<any> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<any> => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id: string): Promise<any> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
