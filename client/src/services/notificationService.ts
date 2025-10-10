import api from './api';

export const notificationService = {
  getNotifications: async (limit = 20) => {
    const response = await api.get('/notifications', { params: { limit } });
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

