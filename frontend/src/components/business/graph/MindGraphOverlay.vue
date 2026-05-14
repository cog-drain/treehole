<template>
  <div class="graph-overlay">
    <div class="header-group">
      <h2 class="graph-title">Collective Consciousness</h2>
      <p class="graph-subtitle">Graph View / Collective Subconscious</p>
    </div>
    <div class="graph-controls">
      <button class="control-btn" title="Reset View" @click="$emit('reset')">
        <Target :size="14" />
      </button>
      <button class="control-btn" :title="showLinks ? 'Hide Links' : 'Show Links'" @click="$emit('toggle-links')">
        <Share2 :size="14" :class="{ 'text-blue-400': showLinks }" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Target, Share2 } from 'lucide-vue-next'

defineProps({
  showLinks: { type: Boolean, default: true }
})

defineEmits(['reset', 'toggle-links'])
</script>

<style scoped>
.graph-overlay {
  position: absolute;
  top: 32px;
  left: 32px;
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.graph-title {
  color: rgba(255, 255, 255, 0.9);
  font-family: Inter, system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.graph-subtitle {
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.graph-controls {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.control-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
