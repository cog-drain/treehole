<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClass"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])

const baseClass = 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-[0.14em] uppercase transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40'

const sizeClassMap = {
  sm: 'h-9 px-4 text-[10px]',
  md: 'h-11 px-5 text-[11px]',
  lg: 'h-12 px-6 text-xs',
  icon: 'h-11 w-11 text-xs'
}

const variantClassMap = {
  default: 'bg-slate-900 text-white shadow-[0_14px_30px_-18px_rgba(15,23,42,0.7)] hover:bg-slate-800',
  secondary: 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200',
  ghost: 'bg-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200',
  primary: 'bg-blue-600 text-white shadow-[0_14px_30px_-18px_rgba(37,99,235,0.75)] hover:bg-blue-500',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15',
  success: 'bg-emerald-600 text-white shadow-[0_14px_30px_-18px_rgba(5,150,105,0.75)] hover:bg-emerald-500',
  link: 'h-auto rounded-none bg-transparent px-0 py-0 text-slate-500 hover:text-slate-200'
}

const buttonClass = computed(() => [
  baseClass,
  sizeClassMap[props.size] || sizeClassMap.md,
  variantClassMap[props.variant] || variantClassMap.default,
  props.block ? 'w-full' : ''
])
</script>
