<script setup>
import { Sparkles, X } from 'lucide-vue-next'

const props = defineProps({
    form: { type: Object, required: true },
    toneMap: { type: Object, default: () => ({}) },
    showTonePanel: { type: Boolean, default: false },
    toneSelectorRef: { type: Object, default: null },
    isMobile: { type: Boolean, default: false }
})

defineEmits(['toggle-tone-panel', 'set-tone'])

function bindToneSelector(el) {
    if (props.toneSelectorRef) props.toneSelectorRef.value = el
}
</script>

<template>
    <div :ref="bindToneSelector" class="relative flex items-center">
        <button
            v-if="!showTonePanel"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full border text-[11px] transition-all active:scale-95"
            :class="
                form.mood
                    ? 'bg-blue-500/10 border-blue-500/25 text-blue-500 hover:bg-blue-500/15'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            "
            @click.stop="$emit('toggle-tone-panel', true)"
        >
            <Sparkles :size="14" />
            <span class="whitespace-nowrap">{{
                form.mood && toneMap[form.mood] ? toneMap[form.mood].emoji + ' ' + toneMap[form.mood].label : '语气'
            }}</span>
        </button>

        <div
            v-else
            class="z-30 flex items-center gap-0.5 px-1 py-1 rounded-full bg-white/90 backdrop-blur-xl shadow-xl border border-slate-200"
            :class="
                isMobile
                    ? 'absolute left-0 bottom-full mb-2 max-w-[calc(100vw-3rem)] flex-wrap'
                    : 'relative max-w-none flex-nowrap'
            "
        >
            <button
                v-for="(tone, key) in toneMap"
                :key="key"
                class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full transition-all hover:bg-slate-100 active:scale-90"
                :class="
                    form.mood === key ? 'bg-blue-100 ring-1 ring-blue-400/40 scale-110' : 'opacity-60 hover:opacity-100'
                "
                :title="tone.label + ' — ' + tone.desc"
                @click="$emit('set-tone', form.mood === key ? '' : key)"
            >
                <span class="text-sm">{{ tone.emoji }}</span>
            </button>
            <button
                class="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ml-0.5"
                @click="$emit('toggle-tone-panel', false)"
            >
                <X :size="12" />
            </button>
        </div>
    </div>
</template>
