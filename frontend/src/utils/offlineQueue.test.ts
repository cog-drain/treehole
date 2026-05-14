import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('element-plus', () => ({
  ElNotification: vi.fn()
}))

import { offlineQueue, offlineQueueCount } from './offlineQueue'

describe('offline queue', () => {
  beforeEach(() => {
    localStorage.clear()
    offlineQueueCount.value = 0
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

    offlineQueue.remove(item.id)

    expect(offlineQueue.get()).toHaveLength(0)
    expect(offlineQueueCount.value).toBe(0)
  })

  it('initializes the reactive count from storage', () => {
    localStorage.setItem('treehole_offline_messages', JSON.stringify([{ id: 'a' }, { id: 'b' }]))

    offlineQueue.init()

    expect(offlineQueueCount.value).toBe(2)
  })
})
