<template>
    <div class="collapsed-bar" @click="$emit('expand')">
        <div class="thread-line-collapsed"></div>
        <div class="collapsed-content">
            <span class="collapsed-toggle">+</span>
            <img :src="generateDiceBearAvatar(comment.authorAlias || '匿名')" class="collapsed-avatar" alt="" />
            <span class="collapsed-name" :class="{ 'is-author': comment.authorAlias === '洞主' }">
                {{ comment.authorAlias === '洞主' ? 'AUTHOR' : comment.authorAlias || 'ANON' }}
            </span>
            <span class="collapsed-meta">·</span>
            <span class="collapsed-meta">{{ formatRelativeTime(comment.createTime) }}</span>
            <span v-if="comment.children?.length" class="collapsed-count">
                {{ comment.children.length }} {{ comment.children.length === 1 ? 'reply' : 'replies' }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { generateDiceBearAvatar } from '@/utils/avatar'
import { formatRelativeTime } from '@/utils/time'

defineProps({
    comment: { type: Object, required: true }
})

defineEmits(['expand'])
</script>

<style scoped>
.collapsed-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s;
}

.collapsed-bar:hover {
    background: var(--cmt-hover-bg, rgba(0, 0, 0, 0.03));
}

.thread-line-collapsed {
    width: 2px;
    height: 100%;
    min-height: 20px;
    background: var(--cmt-collapsed-line, #cbd5e1);
    border-radius: 1px;
    flex-shrink: 0;
    margin-left: 14px;
}

.collapsed-content {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
}

.collapsed-toggle {
    font-size: 11px;
    font-weight: 900;
    color: var(--cmt-accent, #3b82f6);
    width: 16px;
    text-align: center;
    flex-shrink: 0;
}

.collapsed-avatar {
    width: 18px;
    height: 18px;
    border-radius: 6px;
    flex-shrink: 0;
}

.collapsed-name {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-secondary);
    letter-spacing: 0.03em;
}

.collapsed-name.is-author {
    color: var(--cmt-accent, #3b82f6);
}

.collapsed-meta {
    font-size: 10px;
    color: var(--color-text-secondary);
    opacity: 0.6;
    font-family: 'JetBrains Mono', monospace;
}

.collapsed-count {
    font-size: 10px;
    font-weight: 700;
    color: var(--cmt-accent, #3b82f6);
    letter-spacing: 0.05em;
}
</style>
