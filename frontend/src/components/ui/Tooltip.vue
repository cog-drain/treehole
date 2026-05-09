<template>
  <div
    class="relative inline-flex"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <slot />

    <Transition name="ui-tooltip">
      <div
        v-if="open"
        class="ui-tooltip-panel left-1/2 bottom-[calc(100%+1rem)] -translate-x-1/2"
      >
        <slot name="content" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<style scoped>
.ui-tooltip-panel {
  position: absolute;
  z-index: 2300;
  width: max-content;
  max-width: min(20rem, 80vw);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 30, 0.9);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.ui-tooltip-enter-active,
.ui-tooltip-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.ui-tooltip-enter-from,
.ui-tooltip-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
