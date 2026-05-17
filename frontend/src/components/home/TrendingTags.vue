<script setup>
import { Bell, BellOff, Hash } from 'lucide-vue-next'

defineProps({
    tags: {
        type: Array,
        default: () => []
    },
    activeTag: {
        type: String,
        default: ''
    },
    subscribedTagIds: {
        type: Object,
        default: () => new Set()
    }
})

defineEmits(['tag-click', 'toggle-subscription'])
</script>

<template>
    <div v-if="tags.length > 0 && !activeTag" class="space-y-4">
        <div class="flex items-center gap-2 ml-1">
            <h3 class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">热门共鸣</h3>
            <span
                class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/70 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600"
            >
                Redis Rank
            </span>
        </div>
        <div class="flex flex-wrap gap-2">
            <div
                v-for="tag in tags"
                :key="tag.id || tag.name"
                class="inline-flex items-center rounded-full bg-white/5 border border-white/5 hover:border-white/20 transition-all text-slate-400 hover:text-slate-200 overflow-hidden"
            >
                <button
                    class="px-4 py-2 text-xs font-medium flex items-center gap-2 hover:bg-white/10"
                    @click="$emit('tag-click', tag.name)"
                >
                    <Hash :size="12" class="opacity-50" />
                    {{ tag.name }}
                    <span class="opacity-30 font-mono">{{ tag.usageCount }}</span>
                </button>
                <button
                    class="tag-subscribe-btn"
                    :class="{ 'is-subscribed': subscribedTagIds.has(String(tag.id)) }"
                    :title="subscribedTagIds.has(String(tag.id)) ? '取消订阅' : '订阅话题'"
                    @click.stop="$emit('toggle-subscription', tag)"
                >
                    <BellOff v-if="subscribedTagIds.has(String(tag.id))" :size="13" />
                    <Bell v-else :size="13" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tag-subscribe-btn {
    width: 32px;
    align-self: stretch;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    color: rgb(148, 163, 184);
    background: rgba(255, 255, 255, 0.02);
    transition: all 0.2s ease;
}

.tag-subscribe-btn:hover,
.tag-subscribe-btn.is-subscribed {
    color: rgb(14, 165, 233);
    background: rgba(14, 165, 233, 0.1);
}
</style>
