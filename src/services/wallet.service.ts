import api from './api';

export const walletService = {
  getMyWallet: async () => {
    const response = await api.get('/wallets/my-wallet');
    return response.data;
  }
};
