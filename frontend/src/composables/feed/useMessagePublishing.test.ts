import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useMessagePublishing } from './useMessagePublishing'
import type { FeedMessage } from '@/types'

vi.mock('element-plus', () => ({
    ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}))

vi.mock('@/api', () => ({
    default: {
        uploadFile: vi.fn(),
        publishMessage: vi.fn()
    }
}))

vi.mock('@/utils/offlineQueue', () => ({
    offlineQueue: { push: vi.fn() }
}))

import api from '@/api'
import { offlineQueue } from '@/utils/offlineQueue'
function createOptions(overrides: Record<string, unknown> = {}) {
    const messages = ref<FeedMessage[]>([])
    return {
        options: {
            form: { content: '', authorAlias: '', mood: '', theme: 'default' },
            imageFile: ref<File | null>(null),
            isConfessionMode: ref(false),
            isOnline: ref(true),
            recordedBlob: ref<Blob | null>(null),
            maskedAudioBlob: ref<Blob | null>(null),
            clearImage: vi.fn(),
            clearAudio: vi.fn(),
            appStore: { addEnergy: vi.fn() },
            emit: vi.fn(),
            messages,
            pageNum: ref(1),
            pageSize: ref(10),
            total: ref(0),
            fetchMessages: vi.fn(),
            fetchTrending: vi.fn(),
            ...overrides
        },
        messages
    }
}

describe('useMessagePublishing', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('publishMessage', () => {
        it('early-returns when form content, image and audio are all empty', async () => {
            const { options } = createOptions()
            const { publishMessage } = useMessagePublishing(options)

            await publishMessage()

            expect(api.publishMessage).not.toHaveBeenCalled()
        })

        it('creates optimistic message, publishes and updates state on success', async () => {
            const mockMessage = { id: 99, content: 'hi', userId: 'u1' }
            vi.mocked(api.publishMessage).mockResolvedValue({
                code: 200,
                data: { message: mockMessage }
            })
            const { options, messages } = createOptions({
                form: { content: 'hi', authorAlias: 'anon', mood: '', theme: 'default' }
            })

            const { publishMessage, publishing } = useMessagePublishing(options)

            const promise = publishMessage()
            expect(publishing.value).toBe(true)

            await promise

            expect(api.publishMessage).toHaveBeenCalled()
            expect(messages.value.length).toBeGreaterThan(0)
            expect(messages.value.at(0)?.isOptimistic).toBeUndefined()
            expect(publishing.value).toBe(false)
        })

        it('falls back to offline queue when offline', async () => {
            const { options } = createOptions({
                form: { content: 'offline msg', authorAlias: 'anon', mood: '', theme: 'default' },
                isOnline: ref(false)
            })
            const { publishMessage } = useMessagePublishing(options)

            await publishMessage()

            expect(offlineQueue.push).toHaveBeenCalled()
            expect(options.clearImage).toHaveBeenCalled()
            expect(options.clearAudio).toHaveBeenCalled()
        })

        it('falls back to offline queue on Network Error', async () => {
            vi.mocked(api.publishMessage).mockRejectedValue(
                Object.assign(new Error('Network Error'), { name: 'Error' })
            )
            const { options } = createOptions({
                form: { content: 'maybe offline', authorAlias: 'anon', mood: '', theme: 'default' }
            })
            const { publishMessage } = useMessagePublishing(options)

            await publishMessage()

            expect(offlineQueue.push).toHaveBeenCalled()
        })
    })

    describe('handlePublishButtonClick', () => {
        it('toggles confession mode at midnight', () => {
            const { options } = createOptions()
            const { handlePublishButtonClick } = useMessagePublishing(options)

            handlePublishButtonClick(true)

            expect(options.isConfessionMode.value).toBe(true)
            expect(api.publishMessage).not.toHaveBeenCalled()
        })

        it('calls publishMessage outside midnight window', async () => {
            vi.mocked(api.publishMessage).mockResolvedValue({
                code: 200,
                data: { message: { id: 1, content: 'x' } }
            })
            const { options } = createOptions({
                form: { content: 'day msg', authorAlias: 'anon', mood: '', theme: 'default' }
            })
            const { handlePublishButtonClick } = useMessagePublishing(options)

            await handlePublishButtonClick(false)

            expect(api.publishMessage).toHaveBeenCalled()
        })
    })

    describe('saveToOfflineQueue', () => {
        it('pushes draft to offline queue and clears form', () => {
            const { options } = createOptions({
                form: { content: 'draft', authorAlias: 'anon', mood: '', theme: 'default' }
            })
            const { saveToOfflineQueue } = useMessagePublishing(options)

            saveToOfflineQueue()

            expect(offlineQueue.push).toHaveBeenCalled()
            expect(options.clearImage).toHaveBeenCalled()
            expect(options.clearAudio).toHaveBeenCalled()
        })
    })
})
