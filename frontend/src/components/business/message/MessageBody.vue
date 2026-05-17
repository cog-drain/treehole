<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pause, Play } from 'lucide-vue-next'
import { openExternalImage } from '@/utils/browser'
import { formatDuration } from '@/utils/time'
import type { FeedMessage } from '@/types'

interface ContentPart {
    text: string
    isTag: boolean
}

const props = defineProps<{
    msg: FeedMessage
    toneInfo?: { class: string } | null
}>()

defineEmits(['tag-click'])

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioRef = ref<HTMLAudioElement | null>(null)
const blockedDomains = ['pixabay.com', 'githubusercontent.com', 'archive.org']

const safeAudioUrl = computed(() => {
    const audioUrl = props.msg.audioUrl
    if (!audioUrl) return null
    return blockedDomains.some(domain => audioUrl.includes(domain)) ? null : audioUrl
})

function parseContent(content: string): ContentPart[] {
    if (!content) return []
    const parts: ContentPart[] = []
    const regex = /(#[^\s#]+)/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) parts.push({ text: content.substring(lastIndex, match.index), isTag: false })
        parts.push({ text: match[0], isTag: true })
        lastIndex = regex.lastIndex
    }
    if (lastIndex < content.length) parts.push({ text: content.substring(lastIndex), isTag: false })
    return parts
}

function togglePlayback() {
    if (!audioRef.value) return
    if (isPlaying.value) audioRef.value.pause()
    else audioRef.value.play()
    isPlaying.value = !isPlaying.value
}

function onTimeUpdate() {
    if (!audioRef.value) return
    currentTime.value = audioRef.value.currentTime
    duration.value = audioRef.value.duration
}

function onEnded() {
    isPlaying.value = false
    currentTime.value = 0
}

function seek(val: number) {
    if (!audioRef.value) return
    audioRef.value.currentTime = val
}

const openImage = openExternalImage
</script>

<template>
    <div class="space-y-6">
        <div
            class="text-lg leading-relaxed text-slate-200/90 whitespace-pre-wrap break-words font-light"
            :class="toneInfo?.class"
        >
            <template v-for="(part, index) in parseContent(msg.content)" :key="index">
                <span
                    v-if="part.isTag"
                    class="text-blue-400 font-bold hover:underline cursor-pointer"
                    @click.stop="$emit('tag-click', part.text.substring(1))"
                    >{{ part.text }}</span
                >
                <span v-else>{{ part.text }}</span>
            </template>
        </div>

        <div
            v-if="msg.audioUrl"
            class="mt-4 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 group/audio max-w-md mx-auto"
        >
            <audio
                ref="audioRef"
                :src="safeAudioUrl || undefined"
                class="hidden"
                @timeupdate="onTimeUpdate"
                @ended="onEnded"
            ></audio>

            <button
                class="w-10 h-10 rounded-full bg-blue-500/80 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all hover:bg-blue-500"
                @click.stop="togglePlayback"
            >
                <Play v-if="!isPlaying" :size="16" fill="currentColor" />
                <Pause v-else :size="16" fill="currentColor" />
            </button>

            <div class="flex-1 space-y-1">
                <div
                    class="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest"
                >
                    <span>{{ formatDuration(currentTime) }}</span>
                    <div class="flex gap-0.5">
                        <div
                            v-for="i in 8"
                            :key="i"
                            class="w-0.5 bg-blue-400/40 rounded-full transition-all"
                            :class="{ 'animate-[bounce_0.6s_infinite]': isPlaying }"
                            :style="{
                                height: Math.sin(i) * 6 + 8 + 'px',
                                animationDelay: i * 0.1 + 's',
                                opacity: isPlaying ? 0.8 : 0.2
                            }"
                        ></div>
                    </div>
                    <span>{{ formatDuration(duration) }}</span>
                </div>
                <el-slider
                    v-model="currentTime"
                    :max="duration || 1"
                    :show-tooltip="false"
                    size="small"
                    class="cyber-slider-mini"
                    @input="seek"
                    @click.stop
                />
            </div>
        </div>

        <div v-if="msg.imageUrl" class="relative group/img">
            <img
                :src="msg.imageUrl"
                class="w-full rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-zoom-in shadow-lg"
                @click="openImage(msg.imageUrl)"
            />
        </div>
    </div>
</template>

<style scoped>
.tone-whisper {
    font-size: 0.85rem !important;
    opacity: 0.45;
    filter: blur(0.5px);
    transition: all 0.4s ease;
    cursor: default;
}
.tone-whisper:hover {
    opacity: 1;
    filter: blur(0);
}
.tone-shout {
    font-size: 1.35rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.03em;
}
.tone-dream {
    filter: blur(1.5px);
    opacity: 0.7;
    font-style: italic;
    transition: all 0.6s ease;
}
.tone-dream:hover {
    filter: blur(0);
    opacity: 1;
}
.tone-glitch {
    font-family: 'Courier New', monospace;
    text-shadow:
        1px 0 rgba(255, 0, 80, 0.4),
        -1px 0 rgba(0, 255, 200, 0.4);
    animation: glitch-text 4s infinite;
}
@keyframes glitch-text {
    0%,
    95%,
    100% {
        text-shadow:
            1px 0 rgba(255, 0, 80, 0.4),
            -1px 0 rgba(0, 255, 200, 0.4);
    }
    96% {
        text-shadow:
            -2px 0 rgba(255, 0, 80, 0.7),
            2px 0 rgba(0, 255, 200, 0.7);
        transform: translateX(1px);
    }
    97% {
        text-shadow:
            2px 0 rgba(255, 0, 80, 0.7),
            -2px 0 rgba(0, 255, 200, 0.7);
        transform: translateX(-1px);
    }
    98% {
        text-shadow:
            0 0 rgba(255, 0, 80, 0.4),
            0 0 rgba(0, 255, 200, 0.4);
        transform: translateX(0);
    }
}
.tone-poetic {
    font-family: 'Georgia', 'Noto Serif SC', serif;
    font-style: italic;
    letter-spacing: 0.08em;
    line-height: 2.2 !important;
    text-shadow: 0 0 20px rgba(147, 130, 220, 0.15);
}
</style>
