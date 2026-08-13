import api from './api';

export const bookingsService = {
  createBooking: async (data: any) => {
    const response = await api.post('/rental-bookings', data);
    return response.data;
  },
  getBookings: async () => {
    const response = await api.get('/rental-bookings');
    return response.data;
  },
  updateStatus: async (id: string, data: any) => {
    const response = await api.patch(`/rental-bookings/${id}/status`, data);
    return response.data;
  }
};
