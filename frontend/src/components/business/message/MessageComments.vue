<script setup>
import { computed, ref } from 'vue'
import { Loader2, Send, X } from 'lucide-vue-next'
import CommentItem from '@/components/business/CommentItem.vue'

const props = defineProps({
  msg: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false }
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
        @reply="setReplyTarget"
        @delete="(comment) => $emit('delete-comment', { msg, comment })"
        @react="$emit('react')"
      />
    </div>

    <div v-if="replyTarget" class="reply-quote-bar">
      <div class="reply-quote-line"></div>
      <div class="reply-quote-content">
        <span class="reply-quote-name">{{ replyTarget.authorAlias || 'ANON' }}</span>
        <span class="reply-quote-text">{{ replyTarget.content?.substring(0, 60) }}{{ replyTarget.content?.length > 60 ? '...' : '' }}</span>
      </div>
      <button class="reply-quote-close" @click.stop="clearReply">
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
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
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
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
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
