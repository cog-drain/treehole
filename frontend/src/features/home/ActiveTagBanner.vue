<template>
  <Transition name="page">
    <div
      v-if="activeTag"
      class="flex items-center justify-between px-6 py-4 rounded-2xl border shadow-sm transition-colors duration-500"
      :class="isDark
        ? 'bg-blue-500/10 border-blue-500/20'
        : 'bg-white/80 border-blue-200/80 shadow-[0_18px_40px_-24px_rgba(37,99,235,0.35)]'"
    >
      <div class="flex items-center gap-2">
        <Hash :size="16" :class="isDark ? 'text-blue-400' : 'text-blue-600'" />
        <span :class="isDark ? 'text-sm font-medium text-blue-100' : 'text-sm font-semibold text-slate-700'">
          正在查看话题:
          <span :class="isDark ? 'text-blue-300' : 'text-blue-600'">#{{ activeTag }}</span>
        </span>
      </div>
      <button
        @click="$emit('clear')"
        class="text-xs font-semibold transition-colors"
        :class="isDark ? 'text-blue-400 hover:text-blue-300 hover:underline' : 'text-blue-600 hover:text-blue-700 hover:underline'"
      >
        返回全域
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { Hash } from 'lucide-vue-next'

defineProps({
  activeTag: { type: String, default: '' },
  isDark: { type: Boolean, default: false }
})

defineEmits(['clear'])
</script>
