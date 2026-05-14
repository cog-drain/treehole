<template>
  <div class="comment-node" :class="{ 'is-collapsed': isCollapsed }">
    <CommentCollapsed v-if="isCollapsed" :comment="comment" @expand="isCollapsed = false" />

    <div v-else class="comment-expanded">
      <CommentThreadLine :depth="depth" @collapse="isCollapsed = true" />

      <div class="comment-body">
        <CommentBody :comment="comment" />

        <CommentActions
          :comment="comment"
          :is-admin="isAdmin"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
          @react="$emit('react')"
        />

        <CommentChildren
          :comment="comment"
          :is-admin="isAdmin"
          :depth="depth"
          :max-depth="maxDepth"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
          @react="$emit('react')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommentActions from './comment/CommentActions.vue'
import CommentBody from './comment/CommentBody.vue'
import CommentChildren from './comment/CommentChildren.vue'
import CommentCollapsed from './comment/CommentCollapsed.vue'
import CommentThreadLine from './comment/CommentThreadLine.vue'

const props = defineProps({
  comment: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
  depth: { type: Number, default: 0 },
  maxDepth: { type: Number, default: 4 },
  defaultExpanded: { type: Boolean, default: true }
})

const emit = defineEmits(['reply', 'delete', 'react'])

const isCollapsed = ref(!props.defaultExpanded)
</script>

<style scoped>
.comment-node {
  position: relative;
}

.comment-expanded {
  display: flex;
  gap: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;
}
</style>
