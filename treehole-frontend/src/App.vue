<template>
  <div class="app-wrapper">
    <header class="app-header">
      <button class="theme-switch" @click="toggleDark" :title="isDark ? '切换到白天模式' : '切换到夜间模式'">
        {{ isDark ? '🌙' : '☀️' }}
      </button>
      <div class="header-content">
        <h1>🌳 树洞留言板</h1>
        <p>在这里，匿名说出你的心声</p>
      </div>
    </header>

    <main class="main-container">
      <Home />
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Home from './views/Home.vue'

const isDark = ref(false)

onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark'
  if (isDark.value) document.documentElement.classList.add('dark')
})

function toggleDark() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 40px 20px 30px;
  text-align: center;
  background: var(--header-bg);
  background: linear-gradient(180deg, var(--header-bg) 0%, transparent 100%);
  position: relative;
}

.theme-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}
.theme-switch:hover { transform: scale(1.1); }

.header-content h1 {
  margin: 0;
  font-size: 2.2rem;
  color: #1e88e5;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.header-content p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.main-container {
  flex: 1;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px 60px;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .app-header { padding: 30px 15px 20px; }
  .header-content h1 { font-size: 1.8rem; }
  .main-container { padding: 0 10px 40px; }
}
</style>
