<script setup>
import { Loader2, Send, X } from 'lucide-vue-next'

defineProps({
    msg: { type: Object, required: true },
    replyTarget: { type: Object, default: null }
})

defineEmits(['clear-reply', 'publish-comment'])
</script>

<template>
    <div>
        <div v-if="replyTarget" class="reply-quote-bar">
            <div class="reply-quote-line"></div>
            <div class="reply-quote-content">
                <span class="reply-quote-name">{{ replyTarget.authorAlias || 'ANON' }}</span>
                <span class="reply-quote-text"
                    >{{ replyTarget.content?.substring(0, 60)
                    }}{{ replyTarget.content?.length > 60 ? '...' : '' }}</span
                >
            </div>
            <button class="reply-quote-close" @click.stop="$emit('clear-reply')">
                <X :size="14" />
            </button>
        </div>

        <div class="comment-input-row">
            <div class="comment-input-wrap">
                <textarea
                    v-model="msg._commentText"
                    class="comment-input"
                    :placeholder="replyTarget ? `回复 ${replyTarget.authorAlias}...` : '写下你的回响...'"
                    rows="1"
                    @keyup.enter.ctrl="() => $emit('publish-comment', msg)"
                    @keyup.enter.meta="() => $emit('publish-comment', msg)"
                ></textarea>
            </div>
            <button
                class="comment-send-btn"
                :disabled="msg._commenting || (!msg._commentText && !msg._commentImage)"
                @click="$emit('publish-comment', msg)"
            >
                <Loader2 v-if="msg._commenting" class="animate-spin" :size="18" />
                <Send v-else :size="18" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.reply-quote-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    margin-top: 12px;
    background: rgba(59, 130, 246, 0.06);
    border-radius: 10px;
    animation: quote-slide 0.25s ease;
}

@keyframes quote-slide {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.reply-quote-line {
    width: 3px;
    height: 28px;
    border-radius: 2px;
    background: #3b82f6;
    flex-shrink: 0;
}

.reply-quote-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.reply-quote-name {
    font-size: 10px;
    font-weight: 800;
    color: #3b82f6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.reply-quote-text {
    font-size: 12px;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.reply-quote-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
}

.reply-quote-close:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.comment-input-row {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.comment-input-wrap {
    flex: 1;
    position: relative;
}

.comment-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    padding: 10px 16px;
    font-size: 13px;
    resize: none;
    outline: none;
    color: var(--color-text-primary);
    transition: all 0.2s;
}

.comment-input:focus {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(0, 0, 0, 0.01);
}

.comment-input::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.5;
}

.comment-send-btn {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    border: none;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
}

.comment-send-btn:hover:not(:disabled) {
    background: #2563eb;
}

.comment-send-btn:active:not(:disabled) {
    transform: scale(0.92);
}

.comment-send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
