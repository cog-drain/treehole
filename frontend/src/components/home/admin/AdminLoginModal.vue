<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
    visible: { type: Boolean, default: false },
    password: { type: String, default: '' }
})

const emit = defineEmits(['close', 'login', 'update:password'])
const passwordInputRef = ref(null)

watch(
    () => props.visible,
    async visible => {
        if (!visible) return
        await nextTick()
        passwordInputRef.value?.focus()
    }
)
</script>

<template>
    <Transition name="fade">
        <div
            v-if="visible"
            class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/40 backdrop-blur-[80px]"
        >
            <div class="w-full max-w-md p-12 space-y-12 text-center animate-in fade-in zoom-in-95 duration-700">
                <div class="space-y-4">
                    <h2 class="text-[10px] uppercase tracking-[0.6em] text-red-500 font-bold opacity-80">
                        System.Authorize
                    </h2>
                    <h1 class="text-4xl font-light tracking-tighter text-white/90">Authentication Required</h1>
                </div>

                <div class="relative group">
                    <input
                        ref="passwordInputRef"
                        :value="password"
                        @input="$emit('update:password', $event.target.value)"
                        type="password"
                        autofocus
                        class="w-full bg-transparent border-b border-white/10 py-6 text-4xl text-center font-light tracking-[0.4em] focus:outline-none focus:border-red-500/60 transition-all placeholder:text-white/5"
                        placeholder="••••"
                        @keyup.enter="$emit('login')"
                    />
                    <div
                        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-red-500 transition-all duration-700 group-focus-within:w-full shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    ></div>
                </div>

                <div class="flex flex-col gap-4 pt-8">
                    <button
                        @click="$emit('login')"
                        class="group relative py-4 px-8 overflow-hidden rounded-full border border-white/10 hover:border-red-500/40 transition-all duration-500"
                    >
                        <span
                            class="relative z-10 text-[10px] uppercase tracking-[0.4em] text-white/60 group-hover:text-white"
                            >Initialize Root Access</span
                        >
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                        ></div>
                    </button>
                    <button
                        @click="$emit('close')"
                        class="text-[9px] uppercase tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors"
                    >
                        Abort Connection
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
