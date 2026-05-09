<script setup>
import CommentItem from './CommentItem.vue'

defineProps({
  thread: {
    type: Object,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reply', 'delete', 'react'])
</script>

<template>
  <div class="space-y-4 rounded-[2rem] border border-white/5 bg-black/[0.02] p-4 sm:p-5">
    <CommentItem
      :comment="thread.rootComment"
      :is-admin="isAdmin"
      @reply="$emit('reply', $event)"
      @delete="$emit('delete', $event)"
      @react="$emit('react', $event)"
    />

    <div
      v-if="thread.replies.length > 0"
      class="space-y-3 border-l border-white/8 pl-4 sm:pl-5"
    >
      <CommentItem
        v-for="reply in thread.replies"
        :key="reply.id"
        :comment="reply"
        :is-admin="isAdmin"
        is-reply
        @reply="$emit('reply', $event)"
        @delete="$emit('delete', $event)"
        @react="$emit('react', $event)"
      />
    </div>
  </div>
</template>
