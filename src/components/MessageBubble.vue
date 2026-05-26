<script setup>
import { ref, nextTick } from 'vue';

const props = defineProps({ message: Object });
const emit = defineEmits(['delete', 'edit']);

const isHovered = ref(false);
const isEditing = ref(false);
const editContent = ref(props.message.content);
const editInputRef = ref(null);

const startEditing = async () => {
  isEditing.value = true;
  // Đợi DOM render xong thẻ textarea thì tự động focus con trỏ vào
  await nextTick();
  if (editInputRef.value) {
    editInputRef.value.focus();
  }
};

const handleSave = () => {
  if (editContent.value.trim() && editContent.value !== props.message.content) {
    emit('edit', { id: props.message.id, content: editContent.value });
  }
  isEditing.value = false;
};

const handleCancel = () => {
  isEditing.value = false;
  editContent.value = props.message.content; // Khôi phục lại text cũ
};
</script>

<template>
  <div class="message-row" :class="message.type" @mouseenter="isHovered = true" @mouseleave="isHovered = false">

    <div class="message-container" :class="message.type">

      <div v-if="message.type === 'bot'" class="bot-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
        </svg>
      </div>

      <div class="message-content-wrapper">

        <template v-if="!isEditing">
          <div class="message-text">{{ message.content }}</div>

          <div class="action-menu" v-if="isHovered && message.type === 'user'">
            <button @click="startEditing" title="Chỉnh sửa" class="icon-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button @click="$emit('delete', message.id)" title="Xóa" class="icon-btn danger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="edit-box">
            <textarea ref="editInputRef" v-model="editContent" class="edit-input" rows="3"></textarea>
            <div class="edit-actions">
              <button class="btn-save" @click="handleSave">Lưu thay đổi</button>
              <button class="btn-cancel" @click="handleCancel">Hủy</button>
            </div>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>

<style scoped>
.message-row {
  width: 100%;
  display: flex;
  padding: 12px 0;
  margin-bottom: 8px;
}

/* User nằm bên phải */
.message-row.user {
  justify-content: flex-end;
}

/* Bot nằm bên trái */
.message-row.bot {
  justify-content: flex-start;
}

.message-container {
  display: flex;
  gap: 16px;
  max-width: 80%;
  position: relative;
}

.bot-avatar {
  width: 30px;
  height: 30px;
  background-color: #10a37f;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

/* Khối văn bản của Bot: Nền trong suốt */
.message-container.bot .message-content-wrapper {
  background: transparent;
  color: #ececec;
  padding: 8px 0;
  font-size: 1rem;
  line-height: 1.6;
}

/* Khối văn bản của User: Nền xám bo tròn */
.message-container.user .message-content-wrapper {
  background-color: #2f2f2f;
  color: #ececec;
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-right-radius: 4px;
  font-size: 1rem;
  line-height: 1.5;
}

.message-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Nút Sửa / Xóa tinh tế */
.action-menu {
  position: absolute;
  bottom: -24px;
  right: 0;
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: #ffffff;
  color: #ffffff;
  border: 1px solid #444;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #2f2f2f;
  color: #ececec;
}

.icon-btn.danger:hover {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

/* Khung chỉnh sửa (Edit mode) */
.edit-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 300px;
}

.edit-input {
  width: 100%;
  background: #212121;
  color: #ececec;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
}

.edit-input:focus {
  border-color: #10a37f;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-save {
  background-color: #10a37f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-save:hover { background-color: #0d8265; }

.btn-cancel {
  background-color: transparent;
  color: #ececec;
  border: 1px solid #555;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel:hover { background-color: #444; }
</style>
