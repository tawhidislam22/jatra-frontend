import api from './api';

export const emergencyService = {
  getEmergencies: async () => {
    const response = await api.get('/emergencies');
    return response.data;
  },
  assignMechanic: async (id: string, mechanicId: string) => {
    const response = await api.patch(`/emergencies/${id}/assign`, { mechanicId });
    return response.data;
  },
  updateStatus: async (id: string, data: any) => {
    const response = await api.patch(`/emergencies/${id}/status`, data);
    return response.data;
  }
};
