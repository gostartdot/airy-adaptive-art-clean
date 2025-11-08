import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadPhoto: async (photo: string) => {
    const response = await api.post('/users/upload-photo', { photo });
    return response.data;
  },

  deletePhoto: async (index: number) => {
    const response = await api.delete(`/users/photo/${index}`);
    return response.data;
  },

  // Admin methods
  getAllUsers: async () => {
    const response = await api.get('/users/admin/all');
    return response.data;
  },

  approveVerification: async (userId: string) => {
    const response = await api.post(`/users/admin/${userId}/approve`);
    return response.data;
  },

  rejectVerification: async (userId: string, reason?: string) => {
    const response = await api.post(`/users/admin/${userId}/reject`, { reason });
    return response.data;
  },

  suspendUser: async (userId: string, reason?: string) => {
    const response = await api.post(`/users/admin/${userId}/suspend`, { reason });
    return response.data;
  },

  unsuspendUser: async (userId: string) => {
    const response = await api.post(`/users/admin/${userId}/unsuspend`);
    return response.data;
  },
};

