<script setup>
import { onMounted, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../stores/chatStore';
import MessageBubble from './MessageBubble.vue';
import MessageInput from './MessageInput.vue';

const chatStore = useChatStore();
const { rooms, currentRoomId, filteredMessages, isBotTyping, error, filterType } = storeToRefs(chatStore);

const messageBoxRef = ref(null);
const newRoomName = ref('');
const isSidebarOpen = ref(true);

// --- CÁC TRẠNG THÁI PHỤ TRỢ CHO ROOMS (MỚI) ---
const hoveredRoomId = ref(null);
const isEditingRoomId = ref(null);
const editingRoomName = ref('');
const renameInputRef = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messageBoxRef.value) {
    messageBoxRef.value.scrollTop = messageBoxRef.value.scrollHeight;
  }
};

onMounted(async () => {
  await chatStore.fetchRooms();
  await chatStore.fetchMessages();
  scrollToBottom();
});

watch([filteredMessages, isBotTyping], () => scrollToBottom(), { deep: true });

const handleSendMessage = async (content) => {
  await chatStore.sendUserMessage(content);
  await chatStore.sendBotReply();
};

const handleCreateRoom = async () => {
  if (newRoomName.value.trim()) {
    await chatStore.createRoom(newRoomName.value.trim());
    newRoomName.value = '';
  } else {
    await chatStore.createRoom('Đoạn chat mới');
  }
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// --- HÀM XỬ LÝ SỬA/XÓA ROOM (MỚI) ---
const startRenameRoom = async (room) => {
  isEditingRoomId.value = room.id;
  editingRoomName.value = room.name;
  await nextTick();
  // Focus trực tiếp vào ô input đổi tên
  if (renameInputRef.value && renameInputRef.value.length > 0) {
    renameInputRef.value[0].focus();
  }
};

const saveRoomRename = async (roomId) => {
  if (!isEditingRoomId.value) return;
  const cleanName = editingRoomName.value.trim();
  if (cleanName) {
    await chatStore.renameRoom(roomId, cleanName);
  }
  isEditingRoomId.value = null;
};

const handleDeleteRoom = async (roomId) => {
  if (confirm('Bạn có chắc chắn muốn xóa đoạn chat này không? Toàn bộ tin nhắn bên trong sẽ bị mất.')) {
    await chatStore.removeRoom(roomId);
  }
};
</script>

<template>
  <div class="chatgpt-container">

    <aside class="sidebar" :class="{ 'sidebar-closed': !isSidebarOpen }">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="handleCreateRoom">
          <span class="icon-plus">＋</span> Thêm đoạn chat mới
        </button>
        <button class="toggle-btn" @click="toggleSidebar" title="Đóng thanh bên">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </button>
      </div>

      <div class="sidebar-content">
        <p class="group-title">Lịch sử trò chuyện</p>
        <ul class="room-list">
          <li
            v-for="room in rooms" :key="room.id"
            :class="{ active: room.id === currentRoomId }"
            @click="isEditingRoomId !== room.id && chatStore.selectRoom(room.id)"
            @mouseenter="hoveredRoomId = room.id"
            @mouseleave="hoveredRoomId = null"
            class="room-item"
          >
            <template v-if="isEditingRoomId !== room.id">
              <span class="chat-icon">💬</span>
              <span class="room-name-text">{{ room.name }}</span>

              <div class="room-actions" v-if="hoveredRoomId === room.id">
                <button @click.stop="startRenameRoom(room)" title="Đổi tên phòng" class="room-action-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button @click.stop="handleDeleteRoom(room.id)" title="Xóa đoạn chat" class="room-action-btn danger">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </template>

            <template v-else>
              <span class="chat-icon">📝</span>
              <input
                ref="renameInputRef"
                v-model="editingRoomName"
                @keyup.enter="saveRoomRename(room.id)"
                @blur="saveRoomRename(room.id)"
                @click.stop
                class="room-rename-input"
              />
            </template>
          </li>
        </ul>
      </div>

      <div class="sidebar-footer rgb-glow">
        <div class="user-profile">
          <div class="avatar">V</div>
          <span class="username">FIT4104 Workspace</span>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-nav">
        <div class="nav-left">
          <button v-if="!isSidebarOpen" class="toggle-btn open-btn" @click="toggleSidebar" title="Mở thanh bên">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
          <h2>{{ rooms.find(r => r.id === currentRoomId)?.name || 'Vui lòng chọn phòng chat' }}</h2>
        </div>

        <div class="nav-right">
          <select v-model="filterType" class="modern-select">
            <option value="all">Tất cả tin nhắn</option>
            <option value="user">Tin của tôi</option>
            <option value="bot">Tin của Bot</option>
          </select>
        </div>
      </header>

      <div v-if="error" class="error-toast">{{ error }}</div>

      <div class="chat-area" ref="messageBoxRef">
        <div v-if="!currentRoomId" class="empty-state">
          <div class="bot-logo rgb-glow-logo">📂</div>
          <h3>Hãy chọn hoặc tạo một đoạn chat mới để bắt đầu học tập!</h3>
        </div>
        <div v-else-if="filteredMessages.length === 0" class="empty-state">
          <div class="bot-logo rgb-glow-logo">🤖</div>
          <h3>Tôi có thể giúp gì cho bạn hôm nay?</h3>
        </div>

        <TransitionGroup name="fade-slide" tag="div" class="messages-wrapper">
          <MessageBubble
            v-for="msg in filteredMessages"
            :key="msg.id"
            :message="msg"
            @delete="chatStore.deleteSingleMessage"
            @edit="({id, content}) => chatStore.editMessage(id, content)"
          />
        </TransitionGroup>

        <div v-if="isBotTyping" class="typing-indicator">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      </div>

      <div class="input-section" v-if="currentRoomId">
        <MessageInput @send-message="handleSendMessage" />
        <p class="disclaimer">Trợ lý FIT4104 có thể đưa ra thông tin không chính xác. Hãy kiểm tra lại các thông tin quan trọng.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* TOÀN BỘ THEME GIAO DIỆN TỐI ĐỘC QUYỀN */
.chatgpt-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #212121;
  color: #ececec;
  font-family: Söhne, ui-sans-serif, system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px;
  background-color: #171717;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar-closed { width: 0; opacity: 0; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 12px; }

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
  background: transparent;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.new-chat-btn:hover { background-color: #2f2f2f; }

.toggle-btn {
  background: transparent;
  color: #b4b4b4;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toggle-btn:hover { background-color: #2f2f2f; color: #fff; }

.sidebar-content { flex-grow: 1; overflow-y: auto; padding: 0 12px; }
.group-title { font-size: 0.75rem; color: #8e8e8e; margin: 16px 0 8px 8px; font-weight: 600; }
.room-list { list-style: none; padding: 0; margin: 0; }

/* Cấu trúc phần tử Phòng chat có Sửa/Xóa (MỚI) */
.room-item {
  padding: 12px;
  margin-bottom: 4px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ececec;
  position: relative;
  transition: background 0.2s;
}
.room-item:hover { background: #2f2f2f; }
.room-item.active { background: #2f2f2f; font-weight: bold; }

.room-name-text {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 45px; /* Giữ khoảng trống không đè vào nút hành động */
}

.room-actions {
  position: absolute;
  right: 8px;
  display: flex;
  gap: 4px;
  background: linear-gradient(90deg, transparent 0%, #2f2f2f 40%);
  padding-left: 12px;
  height: 100%;
  align-items: center;
  top: 0;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.room-action-btn {
  background: transparent;
  border: none;
  color: #b4b4b4;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
}
.room-action-btn:hover { color: white; background-color: #444; }
.room-action-btn.danger:hover { color: #ef4444; background-color: rgba(239, 68, 68, 0.1); }

/* Ô Input sửa tên trực tiếp (MỚI) */
.room-rename-input {
  flex-grow: 1;
  background: #171717;
  border: 1px solid #10a37f;
  color: white;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 4px;
  outline: none;
  width: 80%;
}

/* --- SIDEBAR FOOTER EFFECT --- */
.sidebar-footer { padding: 16px; margin: 12px; border-radius: 12px; background: #212121; position: relative; }
.rgb-glow::before {
  content: ""; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
  background-size: 400%; z-index: -1; border-radius: 14px; filter: blur(8px);
  animation: glowing 20s linear infinite; opacity: 0.7;
}
@keyframes glowing { 0% { background-position: 0 0; } 50% { background-position: 400% 0; } 100% { background-position: 0 0; } }

.user-profile { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 32px; height: 32px; background: linear-gradient(135deg, #10a37f, #0d8265);
  color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;
}

/* --- MAIN CONTENT --- */
.main-content { flex-grow: 1; display: flex; flex-direction: column; position: relative; }
.top-nav {
  display: flex; justify-content: space-between; align-items: center; padding: 12px 24px;
  background: rgba(33, 33, 33, 0.8); backdrop-filter: blur(10px); z-index: 10; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.nav-left { display: flex; align-items: center; gap: 16px; }
.nav-left h2 { font-size: 1.1rem; font-weight: 600; margin: 0; }
.open-btn { margin-left: -12px; }

.modern-select {
  background: #2f2f2f; color: white; border: 1px solid #444; padding: 6px 12px; border-radius: 8px; outline: none; cursor: pointer;
}

.chat-area { flex-grow: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; align-items: center; }
.messages-wrapper { width: 100%; max-width: 800px; display: flex; flex-direction: column; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; text-align: center; }
.rgb-glow-logo {
  font-size: 3rem; background: #2f2f2f; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px rgba(16, 163, 127, 0.4); animation: pulse 2s infinite alternate; margin-bottom: 20px;
}
@keyframes pulse { 0% { box-shadow: 0 0 20px rgba(16, 163, 127, 0.3); transform: scale(1); } 100% { box-shadow: 0 0 40px rgba(16, 163, 127, 0.6); transform: scale(1.05); } }
.empty-state h3 { font-size: 1.4rem; font-weight: 500; margin: 0; color: #b4b4b4; }

.input-section { width: 100%; max-width: 800px; margin: 0 auto; padding: 16px 24px; }
.disclaimer { text-align: center; font-size: 0.75rem; color: #8e8e8e; margin-top: 12px; }

.typing-indicator { align-self: flex-start; margin: 16px 0; padding: 12px 20px; background: #2f2f2f; border-radius: 12px; display: flex; gap: 4px; }
.dot { width: 8px; height: 8px; background: #8e8e8e; border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
.dot:nth-child(1) { animation-delay: -0.32s; } .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-20px); }
</style>
