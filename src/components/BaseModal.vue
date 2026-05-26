<script setup>
defineProps({
  show: Boolean,
  title: String
});
defineEmits(['close', 'confirm']);
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h3>{{ title || 'Thông báo' }}</h3>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">Hủy bỏ</button>
        <button class="btn-confirm" @click="$emit('confirm')">Xác nhận</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white; padding: 20px; border-radius: 8px;
  width: 90%; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
h3 { margin-top: 0; color: #333; }
.modal-body { margin: 15px 0; font-size: 0.95rem; color: #555; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
button { padding: 8px 16px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-cancel { background: #eee; color: #333; }
.btn-confirm { background: #e53935; color: white; }
</style>
