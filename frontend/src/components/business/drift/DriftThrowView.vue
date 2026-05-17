<template>
    <div class="relative z-10 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div class="p-1 rounded-2xl border bg-black/[0.03] border-black/5">
            <el-input
                :model-value="modelValue"
                type="textarea"
                :rows="6"
                placeholder="这封信将随机出现在一个陌生人的海滩上..."
                class="zen-textarea-light"
                resize="none"
                @update:model-value="$emit('update:modelValue', $event)"
            />
        </div>
        <div class="flex gap-4">
            <el-button
                class="flex-1 !border-none !rounded-xl !h-12 !bg-black/[0.05] !text-slate-500 hover:!bg-black/10"
                @click="$emit('cancel')"
                >取消</el-button
            >
            <el-button
                class="flex-1 !bg-emerald-600 hover:!bg-emerald-500 !border-none !text-white !rounded-2xl !h-14 font-bold tracking-widest shadow-lg shadow-emerald-600/20"
                :disabled="!modelValue.trim()"
                @click="$emit('submit')"
                >投向大海</el-button
            >
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: String, default: '' }
})

defineEmits(['update:modelValue', 'cancel', 'submit'])
</script>
