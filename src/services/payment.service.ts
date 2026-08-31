import api from './api';

export const paymentService = {
  createCheckoutSession: async (data: { amount: number; rentalBookingId?: string; serviceRequestId?: string; emergencyId?: string }) => {
    const response = await api.post('/payments/create-checkout-session', data);
    return response.data;
  },
  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
  verifyPayment: async (sessionId: string) => {
    const response = await api.get(`/payments/verify?session_id=${sessionId}`);
    return response.data;
  }
};
