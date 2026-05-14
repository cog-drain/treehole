<template>
  <div class="relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
    <div class="grid grid-cols-2 gap-6 mb-6">
      <div
        class="group cursor-pointer p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 active:scale-95 text-center relative overflow-hidden bg-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:bg-white/20"
        @click="$emit('throw')"
      >
        <div class="w-20 h-20 mx-auto rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-5xl mb-6 group-hover:rotate-12 transition-transform duration-500">✉️</div>
        <div class="text-lg font-bold mb-1 tracking-widest text-slate-800">扔一个</div>
        <div class="text-xs opacity-30 uppercase tracking-[0.2em] font-medium">Throw One</div>
      </div>

      <div
        class="group cursor-pointer p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 active:scale-95 text-center relative overflow-hidden bg-white/10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:bg-white/20"
        @click="$emit('pick')"
      >
        <div class="w-20 h-20 mx-auto rounded-[2rem] bg-cyan-500/10 flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">🔍</div>
        <div class="text-lg font-bold mb-1 tracking-widest text-slate-800">捞一个</div>
        <div class="text-xs opacity-30 uppercase tracking-[0.2em] font-medium">Pick One</div>
      </div>
    </div>

    <div
      class="group cursor-pointer mx-auto max-w-[280px] p-4 rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-white/30 bg-white/10 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/30"
      @click="$emit('open-inbox')"
    >
      <div class="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg transition-transform group-hover:rotate-12">📥</div>
      <div class="flex flex-col items-start">
        <span class="text-sm font-bold tracking-widest text-slate-700">回响中心</span>
        <span class="text-[9px] opacity-30 uppercase tracking-tighter">My Echoes</span>
      </div>
    </div>

    <div class="flex justify-center">
      <el-button link class="!text-[11px] opacity-40 uppercase tracking-[0.2em] hover:opacity-100" @click="$emit('close')">
        <ChevronLeft class="w-3 h-3 mr-1" /> 返回岸边
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft } from 'lucide-vue-next'

defineEmits(['throw', 'pick', 'open-inbox', 'close'])
</script>
