<template>
  <textarea
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :disabled="disabled"
    :class="textareaClass"
    @input="$emit('update:modelValue', $event.target.value)"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @paste="$emit('paste', $event)"
    @keyup="$emit('keyup', $event)"
  ></textarea>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  rows: { type: [String, Number], default: 4 },
  placeholder: { type: String, default: '' },
  maxlength: { type: [String, Number], default: undefined },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'default' }
})

defineEmits(['update:modelValue', 'focus', 'blur', 'paste', 'keyup'])

const variantClassMap = {
  default: 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500',
  ghost: 'bg-transparent border-transparent text-slate-200 placeholder:text-slate-600'
}

const textareaClass = computed(() => [
  'w-full rounded-[1.5rem] border px-5 py-4 text-sm leading-7 transition-all focus:border-blue-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  variantClassMap[props.variant] || variantClassMap.default
])
</script>
