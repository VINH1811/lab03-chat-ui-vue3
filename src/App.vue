<script setup>
import ChatWindow from './components/ChatWindow.vue';
</script>

<template>
  <main class="app-main">
    <ChatWindow />
  </main>
</template>

<style>
/* CSS Reset toàn cục cơ bản */
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.app-main {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
