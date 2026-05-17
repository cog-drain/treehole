<script setup>
import { computed, ref } from 'vue'
import CommentItem from '@/components/business/CommentItem.vue'
import CommentReplyBox from './CommentReplyBox.vue'

const props = defineProps({
    msg: { type: Object, required: true },
    isAdmin: { type: Boolean, default: false },
    highlightedCommentId: { type: [String, Number], default: null }
})

const emit = defineEmits(['delete-comment', 'publish-comment', 'react'])

const commentTree = computed(() => {
    const list = props.msg._comments || []
    const map = {}
    const tree = []
    list.forEach(comment => {
        map[comment.id] = { ...comment, children: [] }
    })
    list.forEach(comment => {
        if (comment.parentId && map[comment.parentId]) {
            map[comment.parentId].children.push(map[comment.id])
        } else {
            tree.push(map[comment.id])
        }
    })
    return tree
})

const commentSort = ref('oldest')
const sortOptions = [
    { key: 'oldest', label: '最早' },
    { key: 'newest', label: '最新' },
    { key: 'hottest', label: '最热' }
]

const sortedCommentTree = computed(() => {
    const tree = [...commentTree.value]
    if (commentSort.value === 'newest') {
        tree.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    } else if (commentSort.value === 'hottest') {
        tree.sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))
    }
    return tree
})

const replyTarget = computed(() => {
    if (!props.msg._replyToId) return null
    const list = props.msg._comments || []
    return list.find(comment => comment.id === props.msg._replyToId) || null
})

function setReplyTarget(comment) {
    props.msg._replyToId = comment.id
    props.msg._commentText = `@${comment.authorAlias} `
}

function clearReply() {
    props.msg._replyToId = null
    props.msg._commentText = ''
}
</script>

<template>
    <div class="comment-section">
        <div class="comment-section-header">
            <span class="comment-section-title">
                {{ sortedCommentTree.length }} {{ sortedCommentTree.length === 1 ? 'Comment' : 'Comments' }}
            </span>
            <div class="comment-sort-group">
                <button
                    v-for="option in sortOptions"
                    :key="option.key"
                    class="comment-sort-btn"
                    :class="{ 'is-active': commentSort === option.key }"
                    @click="commentSort = option.key"
                >
                    {{ option.label }}
                </button>
            </div>
        </div>

        <div v-if="sortedCommentTree.length === 0" class="comment-empty">
            <p>Silence is a message too...</p>
        </div>

        <div class="comment-tree">
            <CommentItem
                v-for="comment in sortedCommentTree"
                :key="comment.id"
                :comment="comment"
                :isAdmin="isAdmin"
                :depth="0"
                :maxDepth="4"
                :defaultExpanded="true"
                :highlighted-comment-id="highlightedCommentId"
                @reply="setReplyTarget"
                @delete="comment => $emit('delete-comment', { msg, comment })"
                @react="$emit('react')"
            />
        </div>

        <CommentReplyBox
            :msg="msg"
            :reply-target="replyTarget"
            @clear-reply="clearReply"
            @publish-comment="$emit('publish-comment', $event)"
        />
    </div>
</template>

<style scoped>
.comment-section {
    margin-top: 16px;
    margin-left: 12px;
    margin-right: 12px;
    padding: 20px 24px;
    background: #f8fafc;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 1.25rem;
    animation: comment-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes comment-slide-in {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.comment-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.comment-section-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-secondary);
}

.comment-sort-group {
    display: flex;
    gap: 2px;
    padding: 2px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
}

.comment-sort-btn {
    padding: 3px 10px;
    border-radius: 6px;
    border: none;
    background: transparent;
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.comment-sort-btn:hover {
    background: rgba(0, 0, 0, 0.04);
}

.comment-sort-btn.is-active {
    background: white;
    color: var(--color-text-primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.comment-empty {
    padding: 32px 0;
    text-align: center;
}

.comment-empty p {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-style: italic;
    color: var(--color-text-secondary);
    opacity: 0.5;
}

.comment-tree {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
</style>
