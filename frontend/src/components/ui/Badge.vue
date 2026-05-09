<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'default' }
})

const badgeClassMap = {
  default: 'border border-white/10 bg-white/5 text-slate-400',
  primary: 'border border-blue-500/20 bg-blue-500/10 text-blue-400',
  success: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  warning: 'border border-amber-500/20 bg-amber-500/10 text-amber-400',
  danger: 'border border-red-500/20 bg-red-500/10 text-red-400'
}

const badgeClass = computed(() => [
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
  badgeClassMap[props.variant] || badgeClassMap.default
])
</script>
