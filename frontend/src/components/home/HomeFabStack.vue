<template>
  <div class="home-fab-stack fixed right-8 bottom-8 flex flex-col gap-3 z-[1001]">
    <button
      class="notification-fab w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-sky-400 transition-all active:scale-90 border-sky-500/20"
      :class="{ 'has-unread': notificationUnreadCount > 0 }"
      title="通知中心"
      @click="$emit('open-notifications')"
    >
      <Bell :size="20" />
      <span v-if="notificationUnreadCount > 0" class="notification-fab-badge">{{ notificationBadge }}</span>
    </button>

    <div ref="zenRoot" class="relative group">
      <ZenMenu
        :visible="zenState.showZenMenu"
        :sounds="zenState.zenSounds"
        :current-sound="zenState.currentZenSound"
        :volume="zenState.zenVolume"
        :is-zen-mode="zenState.isZenMode"
        @select-sound="$emit('select-zen-sound', $event)"
        @update:volume="$emit('update:zen-volume', $event)"
        @volume-input="$emit('update-zen-volume', $event)"
        @return="$emit('return-to-zen')"
        @minimize="$emit('minimize-zen')"
        @stop="$emit('stop-zen-mode')"
      />
      <button
        class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all active:scale-90"
        :class="{ 'bg-blue-500 !text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]': zenState.currentZenSound || zenState.isZenMode }"
        @click="$emit('toggle-zen-menu')"
      >
        <Volume2 v-if="zenState.currentZenSound" :size="20" />
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
import { Bell, Fingerprint, Moon, Volume2, Waves } from 'lucide-vue-next'
import ZenMenu from './ZenMenu.vue'

const props = defineProps({
  zenState: { type: Object, required: true },
  notificationUnreadCount: { type: Number, default: 0 },
  notificationBadge: { type: String, default: '0' }
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
  'open-identity',
  'open-notifications'
])

const zenRoot = ref(null)

function handleDocumentClick(event) {
  if (props.zenState.showZenMenu && zenRoot.value && !zenRoot.value.contains(event.target)) {
    emit('close-zen-menu')
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))
</script>

<style scoped>
.notification-fab {
  position: relative;
}

.notification-fab.has-unread {
  color: #0ea5e9;
  border-color: rgba(14, 165, 233, 0.42);
  box-shadow: 0 0 22px rgba(14, 165, 233, 0.18);
}

.notification-fab-badge {
  position: absolute;
  top: -5px;
  right: -7px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e11d48;
  color: white;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  border: 2px solid rgba(15, 23, 42, 0.85);
}

@media (max-width: 640px) {
  .home-fab-stack {
    right: 14px;
    bottom: 18px;
    gap: 10px;
  }

  .home-fab-stack > button,
  .home-fab-stack .group > button {
    width: 44px;
    height: 44px;
  }
}
</style>
