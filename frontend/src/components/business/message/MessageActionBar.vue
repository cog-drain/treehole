<script setup>
import { computed } from 'vue'
import { MessageSquare, Smile } from 'lucide-vue-next'
import api from '@/api'
import { parseReactionMap, REACTION_EMOJIS } from '@/constants/reactions'
import { messageReactionKey } from '@/constants/storageKeys'
import { useReactionState } from '@/composables/useReactionState'

const props = defineProps({
  msg: { type: Object, required: true }
})

const emit = defineEmits(['toggle-comments', 'react'])

const parsedReactions = computed(() => parseReactionMap(props.msg.reactions))

const { getReactedEmoji, hasReacted, setReactedEmoji } = useReactionState(messageReactionKey, () => props.msg.id)

async function toggleReaction(emoji) {
  try {
    await api.reactToMessage(props.msg.id, emoji)
    setReactedEmoji(emoji)
    emit('react')
  } catch (e) {
    console.error('Reaction error:', e)
  }
}
</script>

<template>
  <div class="action-bar">
    <div class="action-bar-left">
      <div
        v-for="(count, emoji) in parsedReactions"
        :key="emoji"
        class="reaction-pill"
        :class="{ 'is-own': hasReacted(emoji) }"
        @click.stop="toggleReaction(emoji)"
      >
        <span class="reaction-emoji">{{ emoji }}</span>
        <span class="reaction-count">{{ count }}</span>
      </div>

      <el-popover placement="top" :width="240" trigger="click" popper-class="reaction-popover">
        <template #reference>
          <button class="add-reaction-trigger">
            <Smile :size="14" />
          </button>
        </template>
        <div class="reaction-picker-grid">
          <button
            v-for="emoji in REACTION_EMOJIS"
            :key="emoji"
            class="reaction-picker-cell"
            :class="{ 'is-selected': hasReacted(emoji) }"
            @click="toggleReaction(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </el-popover>
    </div>

    <button class="comment-toggle-btn" @click="$emit('toggle-comments', msg)">
      <div class="relative">
        <MessageSquare :size="16" />
        <span v-if="msg.commentCount > 0 && !msg._read" class="unread-dot"></span>
      </div>
      <span class="comment-toggle-label">{{ msg._showComments ? 'CLOSE' : 'REPLY' }}</span>
      <span v-if="msg.commentCount > 0" class="comment-toggle-count">{{ msg.commentCount }}</span>
    </button>
  </div>
</template>

<style scoped>
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  gap: 8px;
}
.action-bar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}
.reaction-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
}
.reaction-pill:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}
.reaction-pill:active {
  transform: scale(0.93);
}
.reaction-pill.is-own {
  border-color: var(--cmt-accent, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
}
.reaction-emoji {
  font-size: 14px;
  line-height: 1;
}
.reaction-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.add-reaction-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border-radius: 999px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.4;
}
.action-bar:hover .add-reaction-trigger {
  opacity: 0.8;
}
.add-reaction-trigger:hover {
  opacity: 1 !important;
  border-style: solid;
  border-color: var(--cmt-accent, #3b82f6);
  color: var(--cmt-accent, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}
.reaction-picker-grid {
  display: flex;
  gap: 4px;
  padding: 6px;
}
.reaction-picker-cell {
  flex: 1;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.reaction-picker-cell:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.3);
}
.reaction-picker-cell:active {
  transform: scale(1.5);
}
.reaction-picker-cell.is-selected {
  background: rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.3);
}
.comment-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.03);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.comment-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text-primary);
}
.comment-toggle-btn:active {
  transform: scale(0.95);
}
.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 7px;
  height: 7px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}
.comment-toggle-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.comment-toggle-count {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  opacity: 0.5;
}
</style>
