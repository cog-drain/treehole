<template>
    <el-dialog
        v-model="visible"
        :show-close="false"
        width="min(95vw, 550px)"
        class="drift-bottle-dialog bg-transparent !border-none !shadow-none"
        align-center
        @closed="$emit('update:modelValue', false)"
    >
        <div
            class="relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-700 border is-zen-light bg-white/70 border-black/5 shadow-2xl backdrop-blur-3xl"
        >
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    class="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[80px] animate-pulse bg-cyan-400/10"
                ></div>
                <div
                    class="absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-[80px] animate-pulse bg-blue-400/10"
                    style="animation-delay: -2s"
                ></div>
            </div>

            <div class="relative z-10 text-center mb-8">
                <el-text class="!text-[9px] tracking-[0.8em] uppercase block mb-1 drop-shadow-sm !text-slate-400">
                    Etheral Sea
                </el-text>
                <h3 class="text-xl font-light tracking-[0.2em] drop-shadow-md text-slate-800">
                    {{ stateTitle }}
                </h3>
            </div>

            <DriftInitialView
                v-if="state === 'init'"
                @throw="state = 'throwing'"
                @pick="handlePick"
                @open-inbox="handleOpenInbox"
                @close="visible = false"
            />

            <DriftThrowView
                v-if="state === 'throwing'"
                v-model="newContent"
                @cancel="state = 'init'"
                @submit="handleThrow"
            />

            <DriftPickingView v-if="state === 'picking'" @cancel="state = 'init'" />

            <DriftPickedView
                v-if="(state === 'picked' || state === 'reply') && pickedData"
                v-model:reply-content="replyContent"
                :picked-data="pickedData"
                :is-replying="state === 'reply'"
                @pick="handlePick"
                @return="handleReturn"
                @start-reply="state = 'reply'"
                @cancel-reply="state = 'picked'"
                @reply="handleReply"
            />

            <DriftInboxView v-if="state === 'my-bottles'" :bottles="myBottles" @back="state = 'init'" />

            <DriftSentView v-if="state === 'sent'" />
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import DriftInitialView from './drift/DriftInitialView.vue'
import DriftThrowView from './drift/DriftThrowView.vue'
import DriftPickingView from './drift/DriftPickingView.vue'
import DriftPickedView from './drift/DriftPickedView.vue'
import DriftInboxView from './drift/DriftInboxView.vue'
import DriftSentView from './drift/DriftSentView.vue'
import { useDriftBottleDialog } from '@/composables/useDriftBottleDialog'
import type { Bottle, DriftBottleState } from '@/types'

const props = withDefaults(
    defineProps<{
        modelValue?: boolean
        initialState?: DriftBottleState
        pickedData?: Bottle | null
        userId?: string
    }>(),
    {
        modelValue: false,
        initialState: 'init',
        pickedData: null,
        userId: ''
    }
)

const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
    (event: 'onThrow', content: string): void
    (event: 'onPick'): void
    (event: 'onReply', content: string): void
    (event: 'onReturn'): void
}>()

const {
    visible,
    state,
    newContent,
    replyContent,
    myBottles,
    stateTitle,
    handleThrow,
    handlePick,
    handleReply,
    handleReturn,
    handleOpenInbox
} = useDriftBottleDialog(props, emit)
</script>
