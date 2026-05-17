<script setup lang="ts">
import { Bell, BellOff, Hash } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { messageApi } from '@/api/modules/message'
import type { Id, TrendingTag } from '@/types'

const DEFAULT_VISIBLE_TAG_COUNT = 12

const props = withDefaults(
    defineProps<{
        tags?: TrendingTag[]
        activeTag?: string | null
        subscribedTagIds?: Set<Id | string>
    }>(),
    {
        tags: () => [],
        activeTag: '',
        subscribedTagIds: () => new Set()
    }
)

defineEmits(['tag-click', 'toggle-subscription'])

const allTags = ref<TrendingTag[] | null>(null)
const isExpanded = ref(false)
const isLoadingAll = ref(false)

const displayedTags = computed(() => (isExpanded.value && allTags.value ? allTags.value : props.tags))
const canExpand = computed(() =>
    allTags.value ? allTags.value.length > props.tags.length : props.tags.length >= DEFAULT_VISIBLE_TAG_COUNT
)

async function loadAllTags(showError = false): Promise<void> {
    if (allTags.value || isLoadingAll.value) return
    isLoadingAll.value = true
    try {
        const res = await messageApi.getTrendingTags(0)
        allTags.value = res.data || []
    } catch (error) {
        console.warn('Failed to load all trending tags', error)
        if (showError) ElMessage.warning('全部标签暂时无法加载')
    } finally {
        isLoadingAll.value = false
    }
}

async function toggleExpanded(): Promise<void> {
    if (isExpanded.value) {
        isExpanded.value = false
        return
    }
    if (!allTags.value) await loadAllTags(true)
    if (allTags.value && allTags.value.length > props.tags.length) isExpanded.value = true
}

watch(
    () => props.tags,
    tags => {
        isExpanded.value = false
        allTags.value = null
        if (tags.length >= DEFAULT_VISIBLE_TAG_COUNT) void loadAllTags()
    },
    { immediate: true }
)
</script>

<template>
    <div v-if="props.tags.length > 0 && !props.activeTag" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 ml-1">
            <div class="flex items-center gap-2">
                <h3 class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">热门共鸣</h3>
                <span
                    class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/70 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600"
                >
                    Redis Rank
                </span>
            </div>
            <button
                v-if="canExpand || isExpanded"
                class="expand-tags-btn"
                :disabled="isLoadingAll"
                @click="toggleExpanded"
            >
                {{ isExpanded ? '收起' : isLoadingAll ? '加载中' : '展开全部' }}
            </button>
        </div>
        <div class="flex flex-wrap gap-2">
            <div
                v-for="tag in displayedTags"
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
                    :class="{ 'is-subscribed': props.subscribedTagIds.has(String(tag.id)) }"
                    :title="props.subscribedTagIds.has(String(tag.id)) ? '取消订阅' : '订阅话题'"
                    @click.stop="$emit('toggle-subscription', tag)"
                >
                    <BellOff v-if="props.subscribedTagIds.has(String(tag.id))" :size="13" />
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

.expand-tags-btn {
    min-height: 24px;
    padding: 0 10px;
    border: 1px solid rgba(59, 130, 246, 0.22);
    border-radius: 999px;
    color: rgb(37, 99, 235);
    background: rgba(219, 234, 254, 0.62);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    transition: all 0.2s ease;
}

.expand-tags-btn:hover:not(:disabled) {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(191, 219, 254, 0.78);
}

.expand-tags-btn:disabled {
    cursor: wait;
    opacity: 0.65;
}
</style>
