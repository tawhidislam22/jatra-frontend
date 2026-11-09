import api from './api';
import { WishlistData, WishlistIds } from '@/types/jatra';

export const wishlistService = {
  toggleWishlist: async (data: { vehicleId?: string; centerId?: string }) => {
    const response = await api.post('/wishlist/toggle', data);
    return response.data;
  },

  getMyWishlist: async (): Promise<WishlistData> => {
    const response = await api.get('/wishlist/my-wishlist');
    return response.data?.data || { total: 0, vehicles: [], centers: [] };
  },

  getMyWishlistIds: async (): Promise<WishlistIds> => {
    const response = await api.get('/wishlist/my-ids');
    return response.data?.data || { vehicleIds: [], centerIds: [] };
  },

  removeWishlistItem: async (id: string) => {
    const response = await api.delete(`/wishlist/${id}`);
    return response.data;
  }
};
