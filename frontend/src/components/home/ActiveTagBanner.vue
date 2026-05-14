<template>
  <Transition name="page">
    <div v-if="activeTag" class="flex items-center justify-between px-6 py-4 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-sm backdrop-blur-md">
      <div class="flex items-center gap-2">
        <Hash :size="16" class="text-blue-500" />
        <span class="text-sm font-medium text-slate-700">
          正在查看话题: <span class="text-blue-600 font-bold">{{ activeTag }}</span>
        </span>
      </div>
      <button class="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors" @click="$emit('clear')">
        返回全域
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { Hash } from 'lucide-vue-next'

defineProps({
  activeTag: { type: String, default: '' }
})

defineEmits(['clear'])
</script>
