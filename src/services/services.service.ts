import api from './api';

export const serviceRequestsService = {
  createRequest: async (data: any) => {
    const response = await api.post('/service-requests', data);
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get('/service-requests');
    return response.data;
  },
  assignMechanic: async (id: string, mechanicId: string) => {
    const response = await api.patch(`/service-requests/${id}/assign`, { mechanicId });
    return response.data;
  },
  updateStatus: async (id: string, data: any) => {
    const response = await api.patch(`/service-requests/${id}/status`, data);
    return response.data;
  }
};
