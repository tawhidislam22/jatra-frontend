import api from './api';
import { Vehicle } from '../types/jatra';

export const vehiclesService = {
  registerVehicle: async (data: any) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },
  getAllVehicles: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  getMyVehicles: async () => {
    const response = await api.get('/vehicles/my-vehicles');
    return response.data;
  }
};
