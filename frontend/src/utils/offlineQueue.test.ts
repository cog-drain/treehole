import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('element-plus', () => ({
    ElNotification: vi.fn()
}))

import { ElNotification } from 'element-plus'
import { offlineQueue, offlineQueueCount } from './offlineQueue'

describe('offline queue', () => {
    beforeEach(() => {
        localStorage.clear()
        offlineQueueCount.value = 0
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('pushes unique messages and updates the count', () => {
        offlineQueue.push({ content: 'hello', authorAlias: 'anon' })
        offlineQueue.push({ content: 'hello', authorAlias: 'anon' })

        expect(offlineQueue.get()).toHaveLength(1)
        expect(offlineQueueCount.value).toBe(1)
    })

    it('removes queued messages by id', () => {
        offlineQueue.push({ content: 'first', authorAlias: 'anon' })
        const [item] = offlineQueue.get()

        offlineQueue.remove(item!.id)

        expect(offlineQueue.get()).toHaveLength(0)
        expect(offlineQueueCount.value).toBe(0)
    })

    it('initializes the reactive count from storage', () => {
        localStorage.setItem('treehole_offline_messages', JSON.stringify([{ id: 'a' }, { id: 'b' }]))

        offlineQueue.init()

        expect(offlineQueueCount.value).toBe(2)
    })

    it('recovers to an empty queue when stored data is malformed', () => {
        localStorage.setItem('treehole_offline_messages', '{')

        offlineQueue.init()

        expect(offlineQueue.get()).toEqual([])
        expect(offlineQueueCount.value).toBe(0)
    })

    it('syncs queued messages without local-only fields', async () => {
        vi.useFakeTimers()
        localStorage.setItem(
            'treehole_offline_messages',
            JSON.stringify([
                {
                    id: 'local-only',
                    timestamp: 123,
                    content: 'queued message',
                    authorAlias: 'anon',
                    images: ['a.png']
                }
            ])
        )
        const api = { publishMessage: vi.fn().mockResolvedValue({ id: 1 }) }

        const syncTask = offlineQueue.sync(api)
        await vi.advanceTimersByTimeAsync(300)
        await syncTask

        expect(api.publishMessage).toHaveBeenCalledWith({
            content: 'queued message',
            authorAlias: 'anon',
            images: ['a.png']
        })
        expect(offlineQueue.get()).toEqual([])
        expect(offlineQueueCount.value).toBe(0)
        expect(ElNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '同步成功',
                type: 'success'
            })
        )
    })

    it('keeps failed sync items queued and updates the count', async () => {
        vi.useFakeTimers()
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        localStorage.setItem(
            'treehole_offline_messages',
            JSON.stringify([
                { id: 'ok', timestamp: 1, content: 'sent', authorAlias: 'anon' },
                { id: 'failed', timestamp: 2, content: 'keep me', authorAlias: 'anon' }
            ])
        )
        const api = {
            publishMessage: vi.fn().mockResolvedValueOnce({ id: 1 }).mockRejectedValueOnce(new Error('backend down'))
        }

        const syncTask = offlineQueue.sync(api)
        await vi.advanceTimersByTimeAsync(300)
        await vi.advanceTimersByTimeAsync(300)
        await syncTask

        expect(api.publishMessage).toHaveBeenCalledTimes(2)
        expect(offlineQueue.get()).toEqual([{ id: 'failed', timestamp: 2, content: 'keep me', authorAlias: 'anon' }])
        expect(offlineQueueCount.value).toBe(1)
        expect(ElNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '同步部分失败',
                type: 'error'
            })
        )
        expect(consoleError).toHaveBeenCalled()
    })
})
