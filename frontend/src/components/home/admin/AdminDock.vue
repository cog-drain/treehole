<script setup lang="ts">
import { Lock, LogOut, ShieldAlert, Users } from 'lucide-vue-next'

defineProps({
    visible: { type: Boolean, default: false }
})

defineEmits(['open-blacklist', 'open-password', 'exit'])
</script>

<template>
    <Transition name="page">
        <div v-if="visible" class="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[40] w-[95%] sm:w-auto">
            <div
                class="glass-card !p-3 sm:!p-4 flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-6 shadow-2xl shadow-blue-500/20"
            >
                <div
                    class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                    <ShieldAlert :size="14" />
                    <span class="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Root Auth</span>
                </div>

                <div class="h-4 w-px bg-white/10 hidden sm:block"></div>

                <div class="flex items-center gap-1 sm:gap-2">
                    <button
                        class="p-2 sm:px-4 sm:py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2"
                        @click="$emit('open-blacklist')"
                    >
                        <Users :size="16" />
                        <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Blacklist</span>
                    </button>
                    <button
                        class="p-2 sm:px-4 sm:py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2"
                        @click="$emit('open-password')"
                    >
                        <Lock :size="16" />
                        <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Security</span>
                    </button>
                    <button
                        class="p-2 sm:px-4 sm:py-2 rounded-xl bg-red-500/5 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-2 border border-red-500/10"
                        @click="$emit('exit')"
                    >
                        <LogOut :size="16" />
                        <span class="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">Exit</span>
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
