<template>
    <div v-if="children.length > 0 && depth < maxDepth" class="children-area">
        <CommentItem
            v-for="child in children"
            :key="child.id"
            :comment="child"
            :is-admin="isAdmin"
            :depth="depth + 1"
            :max-depth="maxDepth"
            :default-expanded="depth + 1 < autoExpandDepth"
            :highlighted-comment-id="highlightedCommentId"
            @reply="$emit('reply', $event)"
            @delete="$emit('delete', $event)"
            @react="$emit('react')"
        />
    </div>

    <div v-if="children.length > 0 && depth >= maxDepth" class="continue-thread">
        <button class="continue-thread-btn" @click="expandDeep = !expandDeep">
            {{ expandDeep ? '收起深层回复 ↑' : `继续查看 ${children.length} 条回复 →` }}
        </button>
        <div v-if="expandDeep" class="children-area">
            <CommentItem
                v-for="child in children"
                :key="child.id"
                :comment="child"
                :is-admin="isAdmin"
                :depth="0"
                :max-depth="maxDepth"
                :default-expanded="false"
                :highlighted-comment-id="highlightedCommentId"
                @reply="$emit('reply', $event)"
                @delete="$emit('delete', $event)"
                @react="$emit('react')"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CommentItem from '@/components/business/CommentItem.vue'

const props = defineProps({
    comment: { type: Object, required: true },
    isAdmin: { type: Boolean, default: false },
    depth: { type: Number, default: 0 },
    maxDepth: { type: Number, default: 4 },
    highlightedCommentId: { type: [String, Number], default: null }
})

defineEmits(['reply', 'delete', 'react'])

const expandDeep = ref(false)
const autoExpandDepth = 2
const children = computed(() => props.comment.children || [])
</script>

<style scoped>
.children-area {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 4px;
}

.continue-thread {
    margin-top: 4px;
}

.continue-thread-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 8px;
    border: none;
    background: rgba(59, 130, 246, 0.06);
    color: var(--cmt-accent, #3b82f6);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.continue-thread-btn:hover {
    background: rgba(59, 130, 246, 0.12);
}
</style>
