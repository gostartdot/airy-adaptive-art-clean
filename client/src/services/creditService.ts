import api from './api';

export const creditService = {
  getBalance: async () => {
    const response = await api.get('/credits/balance');
    return response.data;
  },

  getHistory: async (limit = 20) => {
    const response = await api.get('/credits/history', { params: { limit } });
    return response.data;
  },

  refreshCredits: async () => {
    const response = await api.post('/credits/refresh');
    return response.data;
  },
};

