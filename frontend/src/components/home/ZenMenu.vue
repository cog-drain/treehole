<template>
    <Transition name="page">
        <div v-if="visible" class="absolute bottom-full right-0 mb-4 glass-card w-64 p-4 space-y-4">
            <div class="space-y-2">
                <button
                    v-for="sound in sounds"
                    :key="sound.id"
                    class="w-full text-left px-4 py-2 rounded-lg text-xs transition-all flex items-center justify-between"
                    :class="
                        currentSound?.id === sound.id
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                            : 'hover:bg-white/5 text-slate-400'
                    "
                    @click="$emit('select-sound', sound)"
                >
                    <span>{{ sound.icon }} {{ sound.name }}</span>
                    <div v-if="currentSound?.id === sound.id" class="flex gap-1">
                        <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0s]"></div>
                        <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.1s]"></div>
                        <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.2s]"></div>
                    </div>
                </button>
            </div>

            <div class="pt-4 border-t border-white/5">
                <div class="flex items-center justify-between text-[10px] text-slate-500 mb-2 px-1">
                    <span>VOLUME</span>
                    <span>{{ volume }}%</span>
                </div>
                <el-slider
                    :model-value="volume"
                    :show-tooltip="false"
                    size="small"
                    @update:model-value="$emit('update:volume', $event)"
                    @input="$emit('volume-input', $event)"
                />
            </div>

            <div v-if="currentSound" class="space-y-2 mt-4 pt-4 border-t border-white/5">
                <button
                    v-if="!isZenMode"
                    class="w-full py-2 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 hover:bg-blue-500/20 transition-all uppercase tracking-widest"
                    @click="$emit('return')"
                >
                    Return to Zen
                </button>
                <button
                    v-if="isZenMode"
                    class="w-full py-2 rounded-lg bg-slate-500/10 text-slate-400 text-[10px] font-bold border border-slate-500/20 hover:bg-slate-500/20 transition-all uppercase tracking-widest"
                    @click="$emit('minimize')"
                >
                    Minimize UI
                </button>
                <button
                    class="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 hover:bg-red-500/20 transition-all uppercase tracking-widest"
                    @click="$emit('stop')"
                >
                    Terminate All
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
interface ZenSound {
    id: string
    icon: string
    name: string
}

withDefaults(
    defineProps<{
        visible?: boolean
        sounds?: ZenSound[]
        currentSound?: ZenSound | null
        volume?: number
        isZenMode?: boolean
    }>(),
    {
        visible: false,
        sounds: () => [],
        currentSound: null,
        volume: 50,
        isZenMode: false
    }
)

defineEmits(['select-sound', 'update:volume', 'volume-input', 'return', 'minimize', 'stop'])
</script>
