import api from './api';

export const reviewsService = {
  getMyReviews: async () => {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },
  
  createReview: async (data: any) => {
    const response = await api.post('/reviews', data);
    return response.data;
  }
};
