import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { bottleApi } from '@/api/modules/bottle'
import type { Bottle, ComposeFormDraft, DriftBottleState } from '@/types'

interface DriftBottleUserStore {
    alias: string
}

interface DriftBottleAppStore {
    addEnergy: (amount: number) => void
}

interface UseDriftBottleOptions {
    userStore: DriftBottleUserStore
    appStore: DriftBottleAppStore
    form: Pick<ComposeFormDraft, 'theme'>
}

export function useDriftBottle({ userStore, appStore, form }: UseDriftBottleOptions) {
    const bottleVisible = ref(false)
    const bottleState = ref<DriftBottleState>('init')
    const newBottleContent = ref('')
    const pickedBottle = ref<Bottle | null>(null)
    const replyContent = ref('')
    const replied = ref(false)

    function openBottleCenter() {
        bottleVisible.value = true
        bottleState.value = 'init'
        newBottleContent.value = ''
        replyContent.value = ''
        replied.value = false
    }

    async function handleThrowBottle(content?: string) {
        try {
            await bottleApi.throwBottle({
                content: content || newBottleContent.value,
                authorAlias: userStore.alias,
                theme: form.theme || 'default'
            })
            ElMessage.success('瓶子已随海浪飘向远方... (获得 5 ⚡)')
            appStore.addEnergy(5)
            bottleVisible.value = false
        } catch (error) {
            console.warn('Failed to throw bottle', error)
            ElMessage.warning('瓶子暂时无法投递')
        }
    }

    async function handlePickBottle() {
        bottleState.value = 'picking'
        try {
            await new Promise(resolve => {
                setTimeout(resolve, 1500)
            })
            const res = await bottleApi.pickBottle()
            if (res.data) {
                pickedBottle.value = res.data
                bottleState.value = 'picked'
            } else {
                ElMessage.info('海面上空荡荡的')
                bottleState.value = 'init'
            }
        } catch (error) {
            console.warn('Failed to pick bottle', error)
            ElMessage.warning('暂时捞不到瓶子，请稍后再试')
            bottleState.value = 'init'
        }
    }

    async function handleReplyBottle(content?: string) {
        const bottle = pickedBottle.value
        const finalContent = content || replyContent.value
        if (!bottle || !finalContent?.trim()) return
        try {
            await bottleApi.replyBottle(bottle.id, finalContent, userStore.alias)
            ElMessage.success('你的回信已顺着海流出发 ✨ (获得 5 ⚡)')
            appStore.addEnergy(5)
            bottleVisible.value = false
        } catch (error) {
            console.warn('Failed to reply bottle', error)
            ElMessage.warning('回信暂时无法送出')
        }
    }

    async function handleReturnBottle() {
        const bottle = pickedBottle.value
        if (!bottle) return
        try {
            await bottleApi.returnBottle(bottle.id)
            ElMessage.success('瓶子已重回大海的怀抱')
            bottleVisible.value = false
        } catch (error) {
            console.warn('Failed to return bottle', error)
            ElMessage.warning('瓶子暂时无法归还')
        }
    }

    return {
        bottleVisible,
        bottleState,
        newBottleContent,
        pickedBottle,
        replyContent,
        replied,
        openBottleCenter,
        handleThrowBottle,
        handlePickBottle,
        handleReplyBottle,
        handleReturnBottle
    }
}
