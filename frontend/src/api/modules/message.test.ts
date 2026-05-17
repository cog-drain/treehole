import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request, offlineQueue } = vi.hoisted(() => ({
    request: {
        get: vi.fn((url: string, config?: unknown) => ({ method: 'get', url, config })),
        post: vi.fn((url: string, data?: unknown, config?: unknown): unknown => ({
            method: 'post',
            url,
            data,
            config
        })),
        put: vi.fn((url: string) => ({ method: 'put', url })),
        delete: vi.fn((url: string) => ({ method: 'delete', url }))
    },
    offlineQueue: {
        push: vi.fn()
    }
}))

vi.mock('../request', () => ({
    default: request
}))

vi.mock('../../utils/offlineQueue', () => ({
    offlineQueue
}))

import { messageApi } from './message'

describe('message api', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('window', { navigator: { onLine: true } })
    })

    it('maps read, mutation, reaction, and trending endpoints', () => {
        expect(messageApi.getMessages({ pageNum: 2, pageSize: 20, tag: 'night' })).toMatchObject({
            method: 'get',
            url: '/messages',
            config: { params: { pageNum: 2, pageSize: 20, tag: 'night' } }
        })
        expect(messageApi.getMessage('m1')).toMatchObject({ method: 'get', url: '/messages/m1' })
        expect(messageApi.deleteMessage(3)).toMatchObject({ method: 'delete', url: '/messages/3' })
        expect(messageApi.likeMessage(4)).toMatchObject({ method: 'put', url: '/messages/4/like' })
        expect(messageApi.reactToMessage(5, 'spark')).toMatchObject({
            method: 'post',
            url: '/messages/5/reactions',
            data: null,
            config: { params: { emoji: 'spark' } }
        })
        expect(messageApi.witnessMessage(6)).toMatchObject({ method: 'post', url: '/messages/6/witness' })
        expect(messageApi.getRandom()).toMatchObject({ method: 'get', url: '/messages/random' })
        expect(messageApi.getTrendingTags()).toMatchObject({
            method: 'get',
            url: '/tags/trending',
            config: { params: { limit: 10 } }
        })
        expect(messageApi.getTrendingTags(5)).toMatchObject({
            method: 'get',
            url: '/tags/trending',
            config: { params: { limit: 5 } }
        })
        expect(messageApi.getTrendingTags(0)).toMatchObject({
            method: 'get',
            url: '/tags/trending',
            config: { params: { limit: 0 } }
        })
    })

    it('publishes messages through the request client when online', async () => {
        request.post.mockResolvedValue({ code: 200, data: { message: { id: 1 } } } as never)
        const draft = { content: 'hello', authorAlias: 'anon' }

        await expect(messageApi.publishMessage(draft)).resolves.toEqual({
            code: 200,
            data: { message: { id: 1 } }
        })

        expect(request.post).toHaveBeenCalledWith('/messages', draft)
        expect(offlineQueue.push).not.toHaveBeenCalled()
    })

    it('queues messages and returns accepted when the request fails offline', async () => {
        vi.stubGlobal('window', { navigator: { onLine: false } })
        request.post.mockRejectedValue(new Error('offline'))
        const draft = { content: 'queued', authorAlias: 'anon' }

        await expect(messageApi.publishMessage(draft)).resolves.toEqual({
            code: 202,
            msg: '已进入离线队列',
            data: null
        })

        expect(offlineQueue.push).toHaveBeenCalledWith(draft)
    })

    it('queues messages on network errors even when navigator still reports online', async () => {
        request.post.mockRejectedValue(new Error('Network Error'))
        const draft = { content: 'network error', authorAlias: 'anon' }

        await expect(messageApi.publishMessage(draft)).resolves.toMatchObject({ code: 202 })

        expect(offlineQueue.push).toHaveBeenCalledWith(draft)
    })

    it('rethrows non-network publish failures', async () => {
        const error = new Error('validation failed')
        request.post.mockRejectedValue(error)

        await expect(messageApi.publishMessage({ content: '', authorAlias: 'anon' })).rejects.toThrow(error)
        expect(offlineQueue.push).not.toHaveBeenCalled()
    })
})
