<template>
    <div v-if="viewMode === 'graph'" class="h-[850px] relative">
        <MindGraph :visible="viewMode === 'graph'" @node-click="$emit('node-click', $event)" />
    </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const MindGraph = defineAsyncComponent(() => import('@/components/business/MindGraph.vue'))

defineProps({
    viewMode: { type: String, required: true }
})

defineEmits(['node-click'])
</script>
