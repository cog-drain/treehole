<script setup lang="ts">
defineProps({
    visible: { type: Boolean, default: false },
    form: { type: Object, required: true }
})

defineEmits(['update:visible', 'update:old-password', 'update:new-password', 'submit'])
</script>

<template>
    <el-dialog
        :model-value="visible"
        width="min(95vw, 400px)"
        :show-header="false"
        custom-class="glass-dialog"
        @update:model-value="$emit('update:visible', $event)"
    >
        <div class="py-6 space-y-8 text-center">
            <div class="space-y-1">
                <h2 class="text-sm font-bold tracking-widest uppercase text-blue-400">Security.Update</h2>
                <p class="text-[10px] text-slate-500 uppercase">Updating root credentials</p>
            </div>

            <div class="space-y-4">
                <input
                    :value="form.oldPassword"
                    type="password"
                    class="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/40 transition-all text-center tracking-widest"
                    placeholder="CURRENT PASSWORD"
                    @input="$emit('update:old-password', ($event.target as HTMLInputElement).value)"
                />
                <input
                    :value="form.newPassword"
                    type="password"
                    class="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500/40 transition-all text-center tracking-widest"
                    placeholder="NEW PASSWORD"
                    @input="$emit('update:new-password', ($event.target as HTMLInputElement).value)"
                />
            </div>

            <div class="flex gap-4">
                <button
                    class="flex-1 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white"
                    @click="$emit('update:visible', false)"
                >
                    Cancel
                </button>
                <button
                    class="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    @click="$emit('submit')"
                >
                    Update Key
                </button>
            </div>
        </div>
    </el-dialog>
</template>
