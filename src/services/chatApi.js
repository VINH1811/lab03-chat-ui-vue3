import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

export const chatApi = {
  // --- ROUTES CHO ROOMS ---
  async getRooms() {
    return (await apiClient.get('/rooms')).data;
  },
  async addRoom(roomData) {
    return (await apiClient.post('/rooms', roomData)).data;
  },
  // MỚI: Xóa phòng chat
  async deleteRoom(id) {
    return (await apiClient.delete(`/rooms/${id}`)).data;
  },
  // MỚI: Đổi tên phòng chat (Dùng PATCH để chỉ cập nhật trường name)
  async updateRoom(id, partialData) {
    return (await apiClient.patch(`/rooms/${id}`, partialData)).data;
  },

  // --- ROUTES CHO MESSAGES ---
  async getMessages(roomId) {
    const url = roomId ? `/messages?roomId=${roomId}` : '/messages';
    return (await apiClient.get(url)).data;
  },
  async addMessage(messageData) {
    return (await apiClient.post('/messages', messageData)).data;
  },
  async deleteMessage(id) {
    return (await apiClient.delete(`/messages/${id}`)).data;
  },
  async updateMessage(id, partialData) {
    return (await apiClient.patch(`/messages/${id}`, partialData)).data;
  },

  // --- ROUTES CHO BOT ---
  async getBotReplies() {
    return (await apiClient.get('/botReplies')).data;
  }
};
