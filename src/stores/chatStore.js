import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { chatApi } from '../services/chatApi';

export const useChatStore = defineStore('chat', () => {
  // --- STATE ---
  const rooms = ref([]);
  const currentRoomId = ref(null);

  const messages = ref([]);
  const isBotTyping = ref(false);
  const error = ref(null);
  const filterType = ref('all');

  // --- GETTERS ---
  const filteredMessages = computed(() => {
    if (filterType.value === 'all') return messages.value;
    return messages.value.filter(msg => msg.type === filterType.value);
  });

  // --- ACTIONS CHO ROOMS ---
  const fetchRooms = async () => {
    try {
      rooms.value = await chatApi.getRooms();
      if (rooms.value.length > 0 && !currentRoomId.value) {
        currentRoomId.value = rooms.value[0].id;
      }
    } catch {
      error.value = 'Lỗi tải danh sách phòng chat.';
    }
  };

  const createRoom = async (name) => {
    try {
      const newRoom = { id: `room-${Date.now()}`, name };
      const savedRoom = await chatApi.addRoom(newRoom);
      rooms.value.push(savedRoom);
      await selectRoom(savedRoom.id);
    } catch  {
      error.value = 'Lỗi tạo phòng mới.';
    }
  };

  const selectRoom = async (roomId) => {
    currentRoomId.value = roomId;
    await fetchMessages();
  };

  // MỚI: Đổi tên phòng
  const renameRoom = async (id, newName) => {
    try {
      const updatedRoom = await chatApi.updateRoom(id, { name: newName });
      const index = rooms.value.findIndex(r => r.id === id);
      if (index !== -1) {
        rooms.value[index].name = updatedRoom.name; // Cập nhật tên mới trên UI
      }
    } catch  {
      error.value = 'Lỗi khi đổi tên phòng.';
    }
  };

  // MỚI: Xóa phòng
  const removeRoom = async (id) => {
    try {
      await chatApi.deleteRoom(id); // Xóa trên API
      rooms.value = rooms.value.filter(r => r.id !== id); // Xóa khỏi danh sách UI

      // Nếu đang xem phòng vừa bị xóa, tự động chuyển sang phòng khác
      if (currentRoomId.value === id) {
        if (rooms.value.length > 0) {
          await selectRoom(rooms.value[0].id);
        } else {
          currentRoomId.value = null;
          messages.value = []; // Xóa trắng màn hình nếu hết phòng
        }
      }
    } catch  {
      error.value = 'Lỗi khi xóa phòng.';
    }
  };

  // --- ACTIONS CHO MESSAGES ---
  const fetchMessages = async () => {
    if (!currentRoomId.value) return;
    try {
      messages.value = await chatApi.getMessages(currentRoomId.value);
    } catch  {
      error.value = 'Không thể tải tin nhắn.';
    }
  };

  const sendUserMessage = async (content) => {
    const userMsg = {
      id: Date.now().toString(),
      roomId: currentRoomId.value,
      sender: 'Bạn',
      content: content,
      createdAt: new Date().toISOString(),
      type: 'user'
    };
    try {
      const savedMsg = await chatApi.addMessage(userMsg);
      messages.value.push(savedMsg);
    } catch  {
      error.value = 'Lỗi gửi tin nhắn.';
    }
  };

  const sendBotReply = async () => {
    isBotTyping.value = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const replies = await chatApi.getBotReplies();
      if (replies.length > 0) {
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const botMsg = {
          id: Date.now().toString(),
          roomId: currentRoomId.value,
          sender: 'FIT4104 Bot',
          content: randomReply.content,
          createdAt: new Date().toISOString(),
          type: 'bot'
        };
        const savedBotMsg = await chatApi.addMessage(botMsg);
        messages.value.push(savedBotMsg);
      }
    } catch  {
      error.value = 'Lỗi Bot phản hồi.';
    } finally {
      isBotTyping.value = false;
    }
  };

  const editMessage = async (id, newContent) => {
    try {
      const updatedMsg = await chatApi.updateMessage(id, { content: newContent });
      const index = messages.value.findIndex(m => m.id === id);
      if (index !== -1) messages.value[index] = updatedMsg;
    } catch  {
      error.value = 'Lỗi sửa tin nhắn.';
    }
  };

  const deleteSingleMessage = async (id) => {
    try {
      await chatApi.deleteMessage(id);
      messages.value = messages.value.filter(m => m.id !== id);
    } catch {
      error.value = 'Lỗi xóa tin nhắn.';
    }
  };

  return {
    rooms, currentRoomId, messages, filteredMessages, isBotTyping, error, filterType,
    fetchRooms, createRoom, selectRoom, renameRoom, removeRoom, // Đã export 2 hàm mới
    fetchMessages, sendUserMessage, sendBotReply, editMessage, deleteSingleMessage
  };
});
