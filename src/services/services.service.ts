import api from './api';

export const serviceRequestsService = {
  getCenterAvailability: async (centerId: string, date: string, duration = 60) => {
    const response = await api.get(`/service-requests/centers/${centerId}/availability?date=${date}&duration=${duration}`);
    return response.data;
  },

  createRequest: async (data: any) => {
    const response = await api.post('/service-requests', data);
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get('/service-requests');
    return response.data;
  },

  assignMechanic: async (id: string, mechanicId: string, notes?: string) => {
    const response = await api.patch(`/service-requests/${id}/assign`, { mechanicId, notes });
    return response.data;
  },

  startWork: async (id: string) => {
    const response = await api.patch(`/service-requests/${id}/start`);
    return response.data;
  },

  submitCompletion: async (id: string, data: any) => {
    const response = await api.patch(`/service-requests/${id}/complete`, data);
    return response.data;
  },

  verifyCompletion: async (id: string, data: { action: 'APPROVE' | 'REWORK'; notes?: string; newMechanicId?: string }) => {
    const response = await api.patch(`/service-requests/${id}/verify`, data);
    return response.data;
  },

  reopenForRework: async (id: string, data: { reason: string; mechanicId?: string }) => {
    const response = await api.patch(`/service-requests/${id}/reopen`, data);
    return response.data;
  },

  updateStatus: async (id: string, data: any) => {
    const response = await api.patch(`/service-requests/${id}/status`, data);
    return response.data;
  },

  cancelRequest: async (id: string, data?: { reason?: string }) => {
    const response = await api.post(`/service-requests/${id}/cancel`, data || {});
    return response.data;
  }
};
