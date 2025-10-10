import api from './api';

export const matchService = {
  findMatch: async () => {
    const response = await api.post('/matches/find');
    return response.data;
  },

  getMatches: async () => {
    const response = await api.get('/matches');
    return response.data;
  },

  getMatch: async (matchId: string) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  skipMatch: async (matchId: string) => {
    const response = await api.post(`/matches/${matchId}/skip`);
    return response.data;
  },

  requestReveal: async (matchId: string) => {
    const response = await api.post(`/matches/${matchId}/reveal-request`);
    return response.data;
  },

  acceptReveal: async (matchId: string) => {
    const response = await api.post(`/matches/${matchId}/reveal-accept`);
    return response.data;
  },
};

