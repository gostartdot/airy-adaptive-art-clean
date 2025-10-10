import api from './api';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/chats/conversations');
    return response.data;
  },

  getMessages: async (matchId: string, limit = 50, skip = 0) => {
    const response = await api.get(`/chats/match/${matchId}`, {
      params: { limit, skip }
    });
    return response.data;
  },

  sendMessage: async (matchId: string, content: string) => {
    const response = await api.post(`/chats/match/${matchId}`, { content });
    return response.data;
  },

  markAsRead: async (chatId: string) => {
    const response = await api.put(`/chats/${chatId}/read`);
    return response.data;
  },
};

