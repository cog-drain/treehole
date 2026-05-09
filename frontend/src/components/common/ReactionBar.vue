<script setup>
import { computed } from 'vue'
import { Smile, Sparkles } from 'lucide-vue-next'
import UiButton from '@/components/ui/Button.vue'
import UiPopover from '@/components/ui/Popover.vue'

const props = defineProps({
  reactions: {
    type: [Object, String],
    default: () => ({})
  },
  compact: {
    type: Boolean,
    default: false
  },
  showResonance: {
    type: Boolean,
    default: false
  },
  resonanceCount: {
    type: Number,
    default: 0
  },
  resonated: {
    type: Boolean,
    default: false
  },
  reactionOptions: {
    type: Array,
    default: () => ['❤️', '😂', '👍', '🔥', '😭']
  }
})

const emit = defineEmits(['react', 'resonate'])

const parsedReactions = computed(() => {
  if (!props.reactions) return {}
  if (typeof props.reactions === 'object') return props.reactions

  try {
    return JSON.parse(props.reactions)
  } catch {
    return {}
  }
})

const visibleReactions = computed(() => Object.entries(parsedReactions.value).filter(([, count]) => Number(count) > 0))

const reactionPillClass = computed(() => props.compact
  ? 'px-2.5 py-1 text-[10px] rounded-full'
  : 'px-3 py-1.5 text-xs rounded-full')

const iconButtonClass = computed(() => props.compact
  ? 'h-8 px-3 text-[10px]'
  : 'h-9 px-3.5 text-xs')

function handleReactionClick(emoji) {
  emit('react', emoji)
}

function handleResonate() {
  emit('resonate')
}
</script>

<template>
  <div class="reaction-bar flex flex-wrap items-center gap-2">
    <UiButton
      v-if="showResonance"
      variant="ghost"
      :class="[
        reactionPillClass,
        resonated
          ? 'border-blue-500/40 bg-blue-500/12 text-blue-500'
          : 'border-white/10 bg-white/5 text-slate-500 hover:border-blue-500/30 hover:bg-white/10 hover:text-blue-400'
      ]"
      @click.stop="handleResonate"
    >
      <Sparkles :size="compact ? 12 : 14" />
      <span class="font-semibold uppercase tracking-[0.18em]">Resonance</span>
      <span class="font-mono">{{ resonanceCount }}</span>
    </UiButton>

    <UiButton
      v-for="[emoji, count] in visibleReactions"
      :key="emoji"
      variant="ghost"
      size="sm"
      class="border border-white/10 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300"
      :class="reactionPillClass"
      @click.stop="handleReactionClick(emoji)"
    >
      <span>{{ emoji }}</span>
      <span class="font-semibold font-mono">{{ count }}</span>
    </UiButton>

    <UiPopover placement="top-start">
      <template #trigger>
        <UiButton
          variant="ghost"
          size="sm"
          class="border border-white/10 bg-white/5 text-slate-500 hover:border-blue-500/30 hover:bg-white/10 hover:text-blue-400"
          :class="iconButtonClass"
        >
          <Smile :size="compact ? 12 : 14" />
          <span class="font-semibold uppercase tracking-[0.18em]">React</span>
        </UiButton>
      </template>

      <template #default>
        <div class="reaction-popover__grid">
          <button
          v-for="emoji in reactionOptions"
          :key="emoji"
          class="reaction-popover__item"
          @click="handleReactionClick(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </template>
    </UiPopover>
  </div>
</template>
