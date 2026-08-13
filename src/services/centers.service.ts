import api from './api';
import { AutomotiveCenter } from '../types/jatra';

export const centersService = {
  registerCenter: async (data: any) => {
    const response = await api.post('/automotive-centers', data);
    return response.data;
  },
  getAllCenters: async () => {
    const response = await api.get('/automotive-centers');
    return response.data;
  },
  addMechanic: async (centerId: string, data: any) => {
    const response = await api.post(`/automotive-centers/${centerId}/mechanics`, data);
    return response.data;
  }
};
