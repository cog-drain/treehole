<template>
  <div class="fixed right-8 bottom-8 flex flex-col gap-4 z-[1001]">
    <div ref="zenRoot" class="relative group">
      <ZenMenu
        :visible="showZenMenu"
        :sounds="zenSounds"
        :current-sound="currentZenSound"
        :volume="zenVolume"
        :is-zen-mode="isZenMode"
        @select-sound="$emit('select-zen-sound', $event)"
        @update:volume="$emit('update:zen-volume', $event)"
        @volume-input="$emit('update-zen-volume', $event)"
        @return="$emit('return-to-zen')"
        @minimize="$emit('minimize-zen')"
        @stop="$emit('stop-zen-mode')"
      />
      <button
        class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all active:scale-90"
        :class="{ 'bg-blue-500 !text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]': currentZenSound || isZenMode }"
        @click="$emit('toggle-zen-menu')"
      >
        <Volume2 v-if="currentZenSound" :size="20" />
        <Moon v-else :size="20" />
      </button>
    </div>

    <button
      class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all active:scale-90 border-cyan-500/20"
      @click="$emit('open-bottle')"
    >
      <Waves :size="20" />
    </button>

    <button
      class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all active:scale-90 border-purple-500/20"
      @click="$emit('open-identity')"
    >
      <Fingerprint :size="20" />
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Fingerprint, Moon, Volume2, Waves } from 'lucide-vue-next'
import ZenMenu from './ZenMenu.vue'

const props = defineProps({
  showZenMenu: { type: Boolean, default: false },
  isZenMode: { type: Boolean, default: false },
  currentZenSound: { type: Object, default: null },
  zenVolume: { type: Number, default: 50 },
  zenSounds: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'toggle-zen-menu',
  'close-zen-menu',
  'select-zen-sound',
  'update:zen-volume',
  'update-zen-volume',
  'return-to-zen',
  'minimize-zen',
  'stop-zen-mode',
  'open-bottle',
  'open-identity'
])

const zenRoot = ref(null)

function handleDocumentClick(event) {
  if (props.showZenMenu && zenRoot.value && !zenRoot.value.contains(event.target)) {
    emit('close-zen-menu')
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))
</script>
