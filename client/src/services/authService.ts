import api from './api';

export const authService = {
  googleAuth: async (credential: string) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  completeOnboarding: async (data: any) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

