import apiClient from './client';

export const chatApi = {
  getRooms: () => apiClient.get('/chat/rooms'),
  createRoom: (data: { name?: string; type?: string; memberIds: string[] }) =>
    apiClient.post('/chat/rooms', data),
  getMessages: (roomId: string, params?: { before?: string; limit?: number }) =>
    apiClient.get(`/chat/rooms/${roomId}/messages`, { params }),
};
