<script setup lang="ts">
import { Zap } from 'lucide-vue-next'
import { generateDiceBearAvatar } from '@/utils/avatar'
import { openExternalImage } from '@/utils/browser'
import { formatRelativeTime } from '@/utils/time'

defineProps({
    comment: { type: Object, required: true }
})

const openImage = openExternalImage
</script>

<template>
    <div>
        <div class="comment-header">
            <img :src="generateDiceBearAvatar(comment.authorAlias || '匿名')" class="comment-avatar" alt="" />
            <span class="comment-author" :class="{ 'is-author': comment.authorAlias === '洞主' }">
                {{ comment.authorAlias === '洞主' ? 'AUTHOR' : comment.authorAlias || 'ANON' }}
            </span>

            <div v-if="comment.coFrequency" class="resonance-badge">
                <Zap :size="10" fill="#f97316" stroke="#f97316" />
                <span>RESONANCE</span>
            </div>

            <span class="comment-time">{{ formatRelativeTime(comment.createTime) }}</span>
        </div>

        <p class="comment-text">{{ comment.content }}</p>

        <div v-if="comment.imageUrl" class="comment-image-wrap">
            <img :src="comment.imageUrl" class="comment-image" @click.stop="openImage(comment.imageUrl)" />
        </div>
    </div>
</template>

<style scoped>
.comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.comment-avatar {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    flex-shrink: 0;
}

.comment-author {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-secondary);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.comment-author.is-author {
    color: var(--cmt-accent, #3b82f6);
}

.resonance-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1px 8px;
    border-radius: 999px;
    border: 1px solid rgba(251, 191, 36, 0.3);
    background: rgba(255, 247, 237, 0.8);
    backdrop-filter: blur(8px);
}

.resonance-badge span {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: #7c2d12;
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
}

.comment-time {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--color-text-secondary);
    opacity: 0.6;
}

.comment-text {
    font-size: 14px;
    line-height: 1.65;
    color: var(--color-text-primary);
    font-weight: 400;
    margin: 0 0 8px;
    word-break: break-word;
}

.comment-image-wrap {
    margin-bottom: 8px;
}

.comment-image {
    max-width: 200px;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    cursor: zoom-in;
    transition: border-color 0.2s;
}

.comment-image:hover {
    border-color: var(--cmt-accent, #3b82f6);
}

@media (max-width: 640px) {
    .comment-avatar {
        width: 20px;
        height: 20px;
    }

    .comment-text {
        font-size: 13px;
    }
}
</style>
