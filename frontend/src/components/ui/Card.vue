<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'default' },
  padding: { type: String, default: 'md' }
})

const variantClassMap = {
  default: 'border border-white/10 bg-white/5',
  elevated: 'border border-white/10 bg-white/7 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)]',
  muted: 'border border-white/5 bg-black/[0.03]'
}

const paddingClassMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6'
}

const cardClass = computed(() => [
  'rounded-[1.75rem] transition-all',
  variantClassMap[props.variant] || variantClassMap.default,
  paddingClassMap[props.padding] || paddingClassMap.md
])
</script>
