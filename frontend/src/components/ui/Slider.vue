<template>
  <label class="ui-slider" @click.stop>
    <input
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      type="range"
      class="ui-slider__input"
      :style="trackStyle"
      @input="handleInput"
    />
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'input'])

const percentage = computed(() => {
  const span = props.max - props.min || 1
  return Math.max(0, Math.min(100, ((props.modelValue - props.min) / span) * 100))
})

const trackStyle = computed(() => ({
  '--slider-fill': `${percentage.value}%`
}))

function handleInput(event) {
  const value = Number(event.target.value)
  emit('update:modelValue', value)
  emit('input', value)
}
</script>

<style scoped>
.ui-slider {
  display: block;
  width: 100%;
}

.ui-slider__input {
  width: 100%;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.ui-slider__input::-webkit-slider-runnable-track {
  height: 0.35rem;
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(59, 130, 246, 0.9) 0 var(--slider-fill), rgba(255, 255, 255, 0.08) var(--slider-fill) 100%);
}

.ui-slider__input::-moz-range-track {
  height: 0.35rem;
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(59, 130, 246, 0.9) 0 var(--slider-fill), rgba(255, 255, 255, 0.08) var(--slider-fill) 100%);
}

.ui-slider__input::-webkit-slider-thumb {
  appearance: none;
  margin-top: -0.34rem;
  height: 1rem;
  width: 1rem;
  border-radius: 999px;
  border: 2px solid rgba(191, 219, 254, 0.85);
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.ui-slider__input::-moz-range-thumb {
  height: 1rem;
  width: 1rem;
  border-radius: 999px;
  border: 2px solid rgba(191, 219, 254, 0.85);
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}
</style>
