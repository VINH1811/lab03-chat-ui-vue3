<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

const emit = defineEmits(['send-message']);

const textInput = ref('');
const hasWarning = ref(false);
const MAX_LENGTH = 200; // Giới hạn theo yêu cầu bài Lab
const inputElement = ref(null);

const handleSubmit = () => {
  const cleanText = textInput.value.trim();

  if (cleanText && cleanText.length <= MAX_LENGTH) {
    emit('send-message', cleanText);
    textInput.value = '';

    // Reset lại chiều cao của textarea về mặc định
    if (inputElement.value) {
      inputElement.value.style.height = '52px';
    }

    focusInput();
  }
};

const focusInput = () => {
  if (inputElement.value) {
    inputElement.value.focus();
  }
};

// Theo dõi nội dung để cảnh báo ký tự và tự động co giãn chiều cao (Auto-resize)
watch(textInput, async (newValue) => {
  hasWarning.value = newValue.length > MAX_LENGTH;

  // Logic tự động tăng chiều cao ô nhập liệu giống ChatGPT
  await nextTick();
  if (inputElement.value) {
    inputElement.value.style.height = 'auto'; // Reset để tính lại scrollHeight
    // Giới hạn chiều cao tối đa khoảng 150px (tương đương 6-7 dòng), sau đó sẽ hiện thanh cuộn
    inputElement.value.style.height = Math.min(inputElement.value.scrollHeight, 150) + 'px';
  }
});

onMounted(() => {
  focusInput();
  // Set chiều cao mặc định lúc mới tải trang
  if (inputElement.value) {
    inputElement.value.style.height = '52px';
  }
});
</script>

<template>
  <div class="input-container">
    <form @submit.prevent="handleSubmit" class="input-form">

      <div class="input-wrapper" :class="{ 'has-error': hasWarning }">
        <textarea
          ref="inputElement"
          v-model="textInput"
          placeholder="Nhắn tin cho Trợ lý FIT4104..."
          @keydown.enter.prevent="handleSubmit"
          class="chat-textarea"
        ></textarea>

        <button
          type="submit"
          class="send-btn"
          :disabled="!textInput.trim() || hasWarning"
          title="Gửi tin nhắn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="send-icon">
            <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </button>
      </div>

    </form>

    <div class="input-footer">
      <span v-if="hasWarning" class="warning-text">
        ⚠️ Lỗi: Nội dung của bạn đã vượt quá {{ MAX_LENGTH }} ký tự. Vui lòng rút gọn lại.
      </span>
      <span v-else></span> <span class="char-count" :class="{ 'text-danger': hasWarning }">
        {{ textInput.length }} / {{ MAX_LENGTH }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.input-form {
  width: 100%;
  position: relative;
}

.input-wrapper {
  position: relative;
  background-color: #2f2f2f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 26px; /* Bo tròn mạnh giống ChatGPT */
  display: flex;
  align-items: flex-end;
  padding: 6px 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.input-wrapper.has-error {
  border-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.2);
}

.chat-textarea {
  flex-grow: 1;
  background: transparent;
  color: #ececec;
  border: none;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  padding: 8px 45px 8px 8px; /* Trừa khoảng trống bên phải cho nút Gửi */
  max-height: 150px;
  outline: none;
  overflow-y: auto;
}

/* Custom Scrollbar cho Textarea */
.chat-textarea::-webkit-scrollbar { width: 6px; }
.chat-textarea::-webkit-scrollbar-track { background: transparent; }
.chat-textarea::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }

.send-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: white; /* Màu mặc định khi có chữ là trắng/xanh */
  color: black;
  transition: all 0.2s ease;
}

.send-btn:disabled {
  background-color: #444; /* Màu xám khi không có chữ */
  color: #888;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background-color: #10a37f; /* Đổi sang màu xanh đặc trưng khi hover */
  color: white;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 0 12px;
  font-size: 0.75rem;
}

.warning-text {
  color: #ef4444;
  font-weight: 500;
}

.char-count {
  color: #8e8e8e;
  font-weight: 500;
}

.char-count.text-danger {
  color: #ef4444;
}
</style>
