<script setup>
import { Copy, Fingerprint, ShieldAlert, X, Zap } from 'lucide-vue-next'

defineProps({
    visible: { type: Boolean, default: false },
    recoveryKey: { type: String, default: '' },
    inputKey: { type: String, default: '' }
})

defineEmits(['close', 'open-store', 'backup', 'restore', 'copy-key', 'update:input-key'])
</script>

<template>
    <Transition name="fade">
        <div
            v-if="visible"
            class="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md"
            @click.self="$emit('close')"
        >
            <div
                class="glass-card max-w-sm w-full p-8 space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            >
                <Fingerprint
                    class="absolute -right-8 -top-8 w-32 h-32 opacity-[0.03] pointer-events-none rotate-12 text-blue-500"
                />

                <div class="flex items-center justify-between relative z-10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Fingerprint :size="20" />
                        </div>
                        <div>
                            <h3 class="text-sm font-bold tracking-widest uppercase">身份备份</h3>
                            <p class="text-[9px] text-slate-500 uppercase tracking-tighter">Identity Backup Vault</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            class="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all flex items-center gap-2 group/energy"
                            title="能量中心"
                            @click="$emit('open-store')"
                        >
                            <Zap :size="16" class="fill-current" />
                            <span class="text-[10px] font-bold tracking-widest hidden group-hover/energy:inline"
                                >STORE</span
                            >
                        </button>
                        <button
                            class="p-2 rounded-full hover:bg-black/5 transition-colors opacity-40 hover:opacity-100"
                            @click="$emit('close')"
                        >
                            <X :size="18" />
                        </button>
                    </div>
                </div>

                <div class="space-y-6 relative z-10">
                    <div class="space-y-3">
                        <label class="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase px-1"
                            >恢复密钥 / Recovery Key</label
                        >
                        <div
                            v-if="recoveryKey"
                            class="group relative flex items-center gap-2 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 font-mono text-sm text-blue-600 transition-all hover:bg-blue-500/10"
                        >
                            <span class="truncate flex-1 min-w-0 select-all">{{ recoveryKey }}</span>
                            <button
                                class="p-2 hover:bg-blue-500/20 rounded-xl transition-all active:scale-90 text-blue-500 relative z-10 cursor-pointer flex-shrink-0"
                                @click="$emit('copy-key')"
                            >
                                <Copy :size="16" />
                            </button>
                        </div>
                        <button
                            v-else
                            class="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-600/20 text-white font-bold text-xs tracking-widest uppercase transition-all active:scale-95"
                            @click="$emit('backup')"
                        >
                            生成备份密钥
                        </button>
                    </div>
                    <div class="relative py-2 flex items-center">
                        <div class="flex-grow border-t border-slate-200"></div>
                        <span class="flex-shrink mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]"
                            >OR</span
                        >
                        <div class="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div class="space-y-3">
                        <label class="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase px-1"
                            >找回身份 / Restore Identity</label
                        >
                        <div class="flex gap-2">
                            <input
                                :value="inputKey"
                                type="text"
                                class="flex-1 bg-black/5 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-400"
                                placeholder="treehole-xxx"
                                @input="$emit('update:input-key', $event.target.value)"
                            />
                            <button
                                :disabled="!inputKey"
                                class="px-6 rounded-2xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-30"
                                @click="$emit('restore')"
                            >
                                还原
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    class="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 items-start relative z-10"
                >
                    <ShieldAlert class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div class="space-y-1.5 text-[10px] text-amber-600/80 leading-relaxed font-medium">
                        <p class="font-bold text-amber-600">密钥是您穿越树洞的唯一凭证，丢失后无法找回。</p>
                        <ul class="list-disc pl-3 space-y-0.5 opacity-90">
                            <li>
                                <span class="font-bold">可恢复（云端记录）：</span
                                >身份标识、发布记录、历史互动、删除权限、漂流瓶记录。
                            </li>
                            <li>
                                <span class="font-bold">不可恢复（本地缓存）：</span
                                >能量余额与已购商品、离线暂存草稿、当前的匿名昵称与主题偏好。
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
