import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { message } = vi.hoisted(() => ({
    message: {
        success: vi.fn(),
        info: vi.fn()
    }
}))

vi.mock('element-plus', () => ({
    ElMessage: message
}))

vi.mock('@/api', () => {
    const api = {
        replyBottle: vi.fn()
    }

    return {
        default: api,
        pickBottle: vi.fn(),
        returnBottle: vi.fn(),
        throwBottle: vi.fn()
    }
})

import api, { pickBottle, returnBottle, throwBottle } from '@/api'
import type { ComposeFormDraft } from '@/types'
import { useDriftBottle } from './useDriftBottle'

describe('useDriftBottle', () => {
    const userStore = { alias: 'echo' }
    const appStore = { addEnergy: vi.fn() }
    const form = { theme: '' } as Pick<ComposeFormDraft, 'theme'>

    beforeEach(() => {
        vi.clearAllMocks()
        form.theme = ''
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('opens the bottle center with clean draft state', () => {
        const bottle = useDriftBottle({ userStore, appStore, form })
        bottle.newBottleContent.value = 'old'
        bottle.replyContent.value = 'reply'
        bottle.replied.value = true

        bottle.openBottleCenter()

        expect(bottle.bottleVisible.value).toBe(true)
        expect(bottle.bottleState.value).toBe('init')
        expect(bottle.newBottleContent.value).toBe('')
        expect(bottle.replyContent.value).toBe('')
        expect(bottle.replied.value).toBe(false)
    })

    it('throws a bottle with alias and default theme, then awards energy', async () => {
        vi.mocked(throwBottle).mockResolvedValue({ code: 200, data: { id: 1, content: 'message in a bottle' } })
        const bottle = useDriftBottle({ userStore, appStore, form })
        bottle.bottleVisible.value = true
        bottle.newBottleContent.value = 'message in a bottle'

        await bottle.handleThrowBottle()

        expect(throwBottle).toHaveBeenCalledWith({
            content: 'message in a bottle',
            authorAlias: 'echo',
            theme: 'default'
        })
        expect(appStore.addEnergy).toHaveBeenCalledWith(5)
        expect(bottle.bottleVisible.value).toBe(false)
        expect(message.success).toHaveBeenCalled()
    })

    it('picks a bottle after the search delay', async () => {
        vi.useFakeTimers()
        vi.mocked(pickBottle).mockResolvedValue({ code: 200, data: { id: 7, content: 'found' } })
        const bottle = useDriftBottle({ userStore, appStore, form })

        const picking = bottle.handlePickBottle()
        expect(bottle.bottleState.value).toBe('picking')
        await vi.advanceTimersByTimeAsync(1500)
        await picking

        expect(bottle.pickedBottle.value).toMatchObject({ id: 7, content: 'found' })
        expect(bottle.bottleState.value).toBe('picked')
    })

    it('returns to init and informs the user when no bottle is available', async () => {
        vi.useFakeTimers()
        vi.mocked(pickBottle).mockResolvedValue({ code: 200, data: null })
        const bottle = useDriftBottle({ userStore, appStore, form })

        const picking = bottle.handlePickBottle()
        await vi.advanceTimersByTimeAsync(1500)
        await picking

        expect(bottle.bottleState.value).toBe('init')
        expect(message.info).toHaveBeenCalledWith('海面上空荡荡的')
    })

    it('returns to init when picking a bottle fails', async () => {
        vi.useFakeTimers()
        vi.mocked(pickBottle).mockRejectedValue(new Error('sea is rough'))
        const bottle = useDriftBottle({ userStore, appStore, form })

        const picking = bottle.handlePickBottle()
        await vi.advanceTimersByTimeAsync(1500)
        await picking

        expect(bottle.bottleState.value).toBe('init')
        expect(bottle.pickedBottle.value).toBeNull()
    })

    it('replies to the picked bottle and closes the center', async () => {
        vi.mocked(api.replyBottle).mockResolvedValue({ code: 200, data: { id: 7, content: 'found' } })
        const bottle = useDriftBottle({ userStore, appStore, form })
        bottle.bottleVisible.value = true
        bottle.pickedBottle.value = { id: 7, content: 'found' }
        bottle.replyContent.value = 'reply'

        await bottle.handleReplyBottle()

        expect(api.replyBottle).toHaveBeenCalledWith(7, 'reply', 'echo')
        expect(appStore.addEnergy).toHaveBeenCalledWith(5)
        expect(bottle.bottleVisible.value).toBe(false)
    })

    it('does not reply without a picked bottle or non-empty content', async () => {
        const bottle = useDriftBottle({ userStore, appStore, form })

        await bottle.handleReplyBottle('   ')

        expect(api.replyBottle).not.toHaveBeenCalled()
    })

    it('returns a picked bottle to the sea', async () => {
        vi.mocked(returnBottle).mockResolvedValue({ code: 200, data: null })
        const bottle = useDriftBottle({ userStore, appStore, form })
        bottle.bottleVisible.value = true
        bottle.pickedBottle.value = { id: 'b1', content: 'found' }

        await bottle.handleReturnBottle()

        expect(returnBottle).toHaveBeenCalledWith('b1')
        expect(bottle.bottleVisible.value).toBe(false)
        expect(message.success).toHaveBeenCalledWith('瓶子已重回大海的怀抱')
    })
})
