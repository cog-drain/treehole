<script setup lang="ts">
import { computed } from 'vue'
import { MessageSquare, Smile, Trash2 } from 'lucide-vue-next'
import { commentApi } from '@/api/modules/comment'
import { parseReactionMap, REACTION_EMOJIS } from '@/constants/reactions'
import { commentReactionKey } from '@/constants/storageKeys'
import { useReactionState } from '@/composables/useReactionState'

const props = defineProps({
    comment: { type: Object, required: true },
    isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['reply', 'delete', 'react'])

const parsedReactions = computed(() => parseReactionMap(props.comment.reactions))

const { hasReacted, toggleReaction } = useReactionState(
    commentReactionKey,
    () => props.comment.id,
    emoji => commentApi.reactToComment(props.comment.id, emoji)
)

async function handleReaction(emoji) {
    await toggleReaction(emoji)
    emit('react')
}
</script>

<template>
    <div class="comment-actions-bar">
        <div
            v-for="(count, emoji) in parsedReactions"
            :key="emoji"
            class="reaction-pill"
            :class="{ 'is-own': hasReacted(emoji) }"
            @click.stop="handleReaction(emoji)"
        >
            <span class="reaction-emoji">{{ emoji }}</span>
            <span class="reaction-count">{{ count }}</span>
        </div>

        <el-popover placement="top" :width="200" trigger="click" popper-class="cyber-popover">
            <template #reference>
                <button class="add-reaction-btn" title="添加表情">
                    <Smile :size="14" />
                </button>
            </template>
            <div class="reaction-picker">
                <button
                    v-for="emoji in REACTION_EMOJIS"
                    :key="emoji"
                    class="reaction-picker-item"
                    @click="handleReaction(emoji)"
                >
                    {{ emoji }}
                </button>
            </div>
        </el-popover>

        <span class="actions-divider"></span>

        <button class="action-btn" @click.stop="$emit('reply', comment)">
            <MessageSquare :size="12" />
            <span>Reply</span>
        </button>

        <button
            v-if="comment.isOwner || isAdmin"
            class="action-btn action-btn--danger"
            @click.stop="$emit('delete', comment)"
        >
            <Trash2 :size="12" />
            <span>Remove</span>
        </button>
    </div>
</template>

<style scoped>
.comment-actions-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    flex-wrap: wrap;
}
.reaction-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
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
.reaction-pill.is-own {
    border-color: var(--cmt-accent, #3b82f6);
    background: rgba(59, 130, 246, 0.08);
}
.reaction-pill:active {
    transform: scale(0.93);
}
.reaction-emoji {
    font-size: 12px;
    line-height: 1;
}
.reaction-count {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-secondary);
}
.add-reaction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 24px;
    border-radius: 999px;
    border: 1px dashed rgba(0, 0, 0, 0.1);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0.4;
}
.comment-actions-bar:hover .add-reaction-btn {
    opacity: 0.8;
}
.add-reaction-btn:hover {
    opacity: 1 !important;
    border-style: solid;
    border-color: var(--cmt-accent, #3b82f6);
    color: var(--cmt-accent, #3b82f6);
    background: rgba(59, 130, 246, 0.05);
}
.reaction-picker {
    display: flex;
    gap: 4px;
    padding: 6px;
}
.reaction-picker-item {
    flex: 1;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.reaction-picker-item:hover {
    background: rgba(59, 130, 246, 0.1);
    transform: scale(1.25);
}
.reaction-picker-item:active {
    transform: scale(1.45);
}
.actions-divider {
    width: 1px;
    height: 14px;
    background: rgba(0, 0, 0, 0.08);
    margin: 0 2px;
}
.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 11px;
    cursor: pointer;
    border-radius: 999px;
    transition: all 0.2s;
}
.action-btn:hover {
    background: rgba(0, 0, 0, 0.04);
    color: var(--color-text-primary);
}
.action-btn--danger:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
}
</style>
