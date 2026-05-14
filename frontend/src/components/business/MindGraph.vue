<template>
  <div ref="container" class="graph-3d-container">
    <div ref="graphElement" class="mind-graph-3d"></div>

    <MindGraphOverlay
      :show-links="showLinks"
      @reset="resetCamera"
      @toggle-links="toggleLinks"
    />

    <MindGraphLoading v-if="loading" />
  </div>
</template>

<script setup>
import MindGraphLoading from './graph/MindGraphLoading.vue'
import MindGraphOverlay from './graph/MindGraphOverlay.vue'
import { useMindGraph3D } from '@/composables/graph/useMindGraph3D'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['node-click'])

const {
  container,
  graphElement,
  loading,
  showLinks,
  resetCamera,
  toggleLinks
} = useMindGraph3D(props, emit)
</script>

<style scoped>
.graph-3d-container {
  width: 100%;
  height: 100%;
  background: #161616;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
}

.mind-graph-3d {
  width: 100%;
  height: 100%;
}

:global(.node-tooltip) {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 11px;
  max-width: 240px;
  pointer-events: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  line-height: 1.5;
}
</style>
