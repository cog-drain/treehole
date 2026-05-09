<template>
  <div class="fixed right-8 bottom-8 flex flex-col gap-4 z-[1001]">
    <div class="relative group" v-click-outside="() => showZenMenu = false">
      <Transition name="page">
        <div v-if="showZenMenu" class="absolute bottom-full right-0 mb-4 glass-card w-64 p-4 space-y-4">
          <div class="space-y-2">
            <button 
              v-for="sound in zenSounds" :key="sound.id" 
              @click="$emit('select-sound', sound)"
              class="w-full text-left px-4 py-2 rounded-lg text-xs transition-all flex items-center justify-between"
              :class="currentZenSound?.id === sound.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'hover:bg-white/5 text-slate-400'"
            >
              <span>{{ sound.icon }} {{ sound.name }}</span>
              <div v-if="currentZenSound?.id === sound.id" class="flex gap-1">
                <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0s]"></div>
                <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.1s]"></div>
                <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.2s]"></div>
              </div>
            </button>
          </div>
          <div class="pt-4 border-t border-white/5">
            <div class="flex items-center justify-between text-[10px] text-slate-500 mb-2 px-1">
              <span>VOLUME</span>
              <span>{{ zenVolume }}%</span>
            </div>
            <UiSlider :model-value="zenVolume" @update:modelValue="$emit('update-volume', $event)" @input="$emit('update-volume', $event)" />
          </div>
          <div v-if="currentZenSound" class="space-y-2 mt-4 pt-4 border-t border-white/5">
            <button @click="$emit('return-zen')" v-if="!isZenMode" class="w-full py-2 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 hover:bg-blue-500/20 transition-all uppercase tracking-widest">Return to Zen</button>
            <button @click="$emit('minimize-zen')" v-if="isZenMode" class="w-full py-2 rounded-lg bg-slate-500/10 text-slate-400 text-[10px] font-bold border border-slate-500/20 hover:bg-slate-500/20 transition-all uppercase tracking-widest">Minimize UI</button>
            <button @click="$emit('stop-zen')" class="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 hover:bg-red-500/20 transition-all uppercase tracking-widest">Terminate All</button>
          </div>
        </div>
      </Transition>
      <button 
        class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all active:scale-90"
        :class="{ 'bg-blue-500 !text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]': currentZenSound || isZenMode }"
        @click="$emit('toggle-menu')"
      >
        <Volume2 v-if="currentZenSound" :size="20" />
        <Moon v-else :size="20" />
      </button>
    </div>

    <button 
      @click="$emit('open-bottle')"
      class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all active:scale-90 border-cyan-500/20"
    >
      <Waves :size="20" />
    </button>

    <button 
      @click="$emit('open-identity')"
      class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all active:scale-90 border-purple-500/20"
    >
      <Fingerprint :size="20" />
    </button>
  </div>
</template>

<script setup>
import { Fingerprint, Moon, Volume2, Waves } from 'lucide-vue-next'
import UiSlider from '@/components/ui/Slider.vue'

defineProps({
  showZenMenu: { type: Boolean, default: false },
  currentZenSound: { type: Object, default: null },
  zenVolume: { type: Number, default: 0 },
  zenSounds: { type: Array, default: () => [] },
  isZenMode: { type: Boolean, default: false },
  vClickOutside: { type: Object, required: true }
})

defineEmits([
  'toggle-menu',
  'select-sound',
  'update-volume',
  'return-zen',
  'minimize-zen',
  'stop-zen',
  'open-bottle',
  'open-identity'
])
</script>
