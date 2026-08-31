import api from './api';
import { Vehicle } from '../types/jatra';

export const vehiclesService = {
  registerVehicle: async (data: any) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },
  getAllVehicles: async (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/vehicles${queryString}`);
    return response.data;
  },
  getMyVehicles: async () => {
    const response = await api.get('/vehicles/my-vehicles');
    return response.data;
  },
  getVehicleById: async (id: string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  updateVehicle: async (id: string, data: any) => {
    const response = await api.patch(`/vehicles/${id}`, data);
    return response.data;
  }
};
