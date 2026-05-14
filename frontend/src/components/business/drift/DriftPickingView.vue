<template>
  <div class="relative z-10 py-16 flex flex-col items-center gap-8 animate-in fade-in duration-700">
    <div class="relative">
      <Waves class="w-20 h-20 animate-pulse scale-150 text-cyan-500/20" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-2 h-2 rounded-full animate-ping bg-cyan-600"></div>
      </div>
    </div>
    <el-text class="!text-xs tracking-[0.5em] animate-pulse !text-slate-400">正在深海搜寻缘分...</el-text>
    <el-button link class="!text-slate-400" @click="$emit('cancel')">放弃搜寻</el-button>
  </div>
</template>

<script setup>
import { Waves } from 'lucide-vue-next'

defineEmits(['cancel'])
</script>
