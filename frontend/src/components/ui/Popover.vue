<template>
  <div ref="rootRef" class="relative inline-flex">
    <div @click="toggle">
      <slot name="trigger" :open="open" />
    </div>

    <Transition name="ui-popover">
      <div
        v-if="open"
        class="ui-popover-panel"
        :class="panelClass"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  placement: { type: String, default: 'top-start' }
})

const open = ref(false)
const rootRef = ref(null)

const panelClass = computed(() => ({
  'left-0 bottom-[calc(100%+0.75rem)] origin-bottom-left': props.placement === 'top-start',
  'right-0 bottom-[calc(100%+0.75rem)] origin-bottom-right': props.placement === 'top-end'
}))

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function handleClickOutside(event) {
  if (!rootRef.value?.contains(event.target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.ui-popover-panel {
  position: absolute;
  z-index: 2300;
  min-width: 220px;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.96);
  box-shadow: 0 20px 50px -24px rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(16px);
}

.ui-popover-enter-active,
.ui-popover-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.ui-popover-enter-from,
.ui-popover-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
