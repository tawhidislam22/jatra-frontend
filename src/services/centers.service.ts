import api from './api';
import { AutomotiveCenter } from '../types/jatra';

export const centersService = {
  registerCenter: async (data: any) => {
    const response = await api.post('/automotive-centers', data);
    return response.data;
  },
  getAllCenters: async (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/automotive-centers${queryString}`);
    return response.data;
  },
  addMechanic: async (centerId: string, data: any) => {
    const response = await api.post(`/automotive-centers/${centerId}/mechanics`, data);
    return response.data;
  },
  getCenterById: async (id: string) => {
    const response = await api.get(`/automotive-centers/${id}`);
    return response.data;
  },
  updateCenter: async (id: string, data: any) => {
    const response = await api.patch(`/automotive-centers/${id}`, data);
    return response.data;
  },
};
