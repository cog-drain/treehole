import { computed, ref, watch } from 'vue'
import api from '@/api'
import type { Bottle, DriftBottleState } from '@/types'

export interface DriftBottleDialogProps {
    modelValue: boolean
    initialState?: DriftBottleState
    pickedData?: Bottle | null
    userId?: string
}

export interface DriftBottleDialogEmit {
    (event: 'onThrow', content: string): void
    (event: 'onPick'): void
    (event: 'onReply', content: string): void
    (event: 'onReturn'): void
}

export function useDriftBottleDialog(props: DriftBottleDialogProps, emit: DriftBottleDialogEmit) {
    const visible = ref(props.modelValue)
    const state = ref<DriftBottleState>(props.initialState || 'init')
    const newContent = ref('')
    const replyContent = ref('')
    const myBottles = ref<Bottle[]>([])

    const stateTitle = computed(() => {
        switch (state.value) {
            case 'throwing':
                return '写下心声'
            case 'picking':
                return '搜寻中'
            case 'picked':
                return '奇妙的缘分'
            case 'reply':
                return '给予回响'
            case 'my-bottles':
                return '回响中心'
            default:
                return '漂流瓶'
        }
    })

    watch(
        () => props.modelValue,
        val => {
            visible.value = val
            if (val) {
                state.value = props.initialState || 'init'
            }
        }
    )

    watch(
        () => props.pickedData,
        val => {
            if (val) state.value = 'picked'
        }
    )

    function handleThrow() {
        emit('onThrow', newContent.value)
        newContent.value = ''
        visible.value = false
    }

    function handlePick() {
        state.value = 'picking'
        emit('onPick')
    }

    function handleReply() {
        emit('onReply', replyContent.value)
        replyContent.value = ''
        state.value = 'sent'
        setTimeout(() => {
            visible.value = false
            setTimeout(() => {
                state.value = 'init'
            }, 500)
        }, 2000)
    }

    function handleReturn() {
        emit('onReturn')
        state.value = 'init'
    }

    async function handleOpenInbox() {
        state.value = 'my-bottles'
        try {
            const res = await api.getMyBottles()
            myBottles.value = res.data || []
        } catch (e) {
            console.error('Fetch my bottles failed:', e)
        }
    }

    return {
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
    }
}
