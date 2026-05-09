<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :disabled="disabled"
    :class="inputClass"
    @input="$emit('update:modelValue', $event.target.value)"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  maxlength: { type: [String, Number], default: undefined },
  disabled: { type: Boolean, default: false },
  align: { type: String, default: 'left' }
})

defineEmits(['update:modelValue', 'focus', 'blur'])

const inputClass = computed(() => [
  'w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition-all placeholder:text-slate-500 focus:border-blue-500/40 focus:bg-white/8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  props.align === 'center' ? 'text-center tracking-[0.18em]' : ''
])
</script>
