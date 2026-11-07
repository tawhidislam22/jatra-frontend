import api from './api';

export const adminService = {
  getOverviewStats: async () => {
    const response = await api.get('/users/admin/overview-stats');
    return response.data;
  },

  getAllUsers: async (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/users${queryString}`);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  verifyCenter: async (id: string, isApproved: boolean) => {
    const response = await api.patch(`/automotive-centers/${id}/verify`, { isApproved });
    return response.data;
  },

  deleteCenter: async (id: string) => {
    const response = await api.delete(`/automotive-centers/${id}`);
    return response.data;
  },

  getAllPayments: async (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/payments/all${queryString}`);
    return response.data;
  },

  getAllReviews: async () => {
    const response = await api.get('/reviews/all');
    return response.data;
  },

  deleteReview: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};
