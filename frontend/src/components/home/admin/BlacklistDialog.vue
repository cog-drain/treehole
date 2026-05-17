<script setup>
defineProps({
    visible: { type: Boolean, default: false },
    blacklist: { type: Array, default: () => [] }
})

defineEmits(['update:visible', 'unban'])
</script>

<template>
    <el-dialog
        :model-value="visible"
        width="min(95vw, 600px)"
        :show-header="false"
        custom-class="glass-dialog"
        @update:model-value="$emit('update:visible', $event)"
    >
        <div class="py-6 space-y-8">
            <div class="space-y-1">
                <h2 class="text-sm font-bold tracking-widest uppercase text-red-400">Restricted Access</h2>
                <p class="text-[10px] text-slate-500 uppercase">Managing banned entities in the void</p>
            </div>

            <div class="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <div
                    v-for="item in blacklist"
                    :key="item.ip"
                    class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-xs font-mono"
                        >
                            IP
                        </div>
                        <div>
                            <p class="text-sm font-mono text-slate-200">{{ item.ip }}</p>
                            <p class="text-[9px] text-slate-500 uppercase">{{ item.reason || 'No reason provided' }}</p>
                        </div>
                    </div>
                    <button
                        class="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all opacity-0 group-hover:opacity-100"
                        @click="$emit('unban', item.ip)"
                    >
                        Release
                    </button>
                </div>
                <div
                    v-if="blacklist.length === 0"
                    class="py-12 text-center text-[10px] text-slate-600 uppercase tracking-widest"
                >
                    The void is empty
                </div>
            </div>

            <button
                class="w-full py-4 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                @click="$emit('update:visible', false)"
            >
                Close Registry
            </button>
        </div>
    </el-dialog>
</template>
