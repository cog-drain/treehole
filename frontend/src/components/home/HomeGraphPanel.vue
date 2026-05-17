<template>
    <div v-if="viewMode === 'graph'" class="h-[850px] relative">
        <MindGraph :visible="viewMode === 'graph'" @node-click="$emit('node-click', $event)" />
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const MindGraph = defineAsyncComponent(() => import('@/components/business/MindGraph.vue'))

defineProps({
    viewMode: { type: String, required: true }
})

defineEmits<{
    (event: 'node-click', nodeId: number | string): void
}>()
</script>
