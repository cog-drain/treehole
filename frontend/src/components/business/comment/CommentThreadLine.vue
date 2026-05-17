<template>
    <div class="thread-col" @click="$emit('collapse')">
        <div class="thread-line" :style="threadLineStyle"></div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    depth: { type: Number, default: 0 }
})

defineEmits(['collapse'])

const threadLineColors = [
    'var(--thread-color-0, #3b82f6)',
    'var(--thread-color-1, #8b5cf6)',
    'var(--thread-color-2, #06b6d4)',
    'var(--thread-color-3, #f59e0b)',
    'var(--thread-color-4, #ef4444)'
]

const threadLineStyle = computed(() => ({
    '--line-color': threadLineColors[props.depth % threadLineColors.length]
}))
</script>

<style scoped>
.thread-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 30px;
    flex-shrink: 0;
    cursor: pointer;
    padding-top: 32px;
}

.thread-line {
    width: 2px;
    flex: 1;
    min-height: 12px;
    background: var(--line-color, #3b82f6);
    opacity: 0.2;
    border-radius: 1px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.thread-col:hover .thread-line {
    width: 3px;
    opacity: 0.6;
}

.thread-col:active .thread-line {
    width: 4px;
    opacity: 0.8;
    transform: scaleX(1.5);
}

@media (max-width: 640px) {
    .thread-col {
        width: 20px;
    }
}
</style>
