import api from './api';
import { Conversation, Message } from '@/types/jatra';

export const messagesService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/conversations');
    return response.data?.data || [];
  },

  getMessages: async (conversationId: string): Promise<{
    conversation: Conversation;
    messages: Message[];
  }> => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data?.data || { conversation: {} as Conversation, messages: [] };
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return response.data?.data;
  },

  markAsRead: async (conversationId: string): Promise<any> => {
    const response = await api.patch(`/conversations/${conversationId}/read`);
    return response.data;
  },
};
