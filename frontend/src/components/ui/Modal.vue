<template>
  <Teleport to="body">
    <Transition name="ui-modal-fade">
      <div v-if="modelValue" class="ui-modal-overlay" @click.self="close">
        <div class="ui-modal-shell" :style="shellStyle">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  maxWidth: { type: String, default: '32rem' }
})

const emit = defineEmits(['update:modelValue', 'closed'])

const shellStyle = computed(() => ({
  width: `min(95vw, ${props.maxWidth})`
}))

watch(() => props.modelValue, (visible, previous) => {
  if (!visible && previous) {
    emit('closed')
  }
})

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.ui-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(18px);
}

.ui-modal-shell {
  max-height: min(92vh, 54rem);
  overflow: auto;
}

.ui-modal-fade-enter-active,
.ui-modal-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.ui-modal-fade-enter-from,
.ui-modal-fade-leave-to {
  opacity: 0;
}
</style>
