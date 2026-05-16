import { describe, expect, it, vi } from 'vitest'
import { tagSubscriptionApi } from './tagSubscription'

vi.mock('../request', () => ({
  default: {
    get: vi.fn((url: string) => ({ method: 'get', url })),
    post: vi.fn((url: string) => ({ method: 'post', url })),
    delete: vi.fn((url: string) => ({ method: 'delete', url }))
  }
}))

describe('tag subscription api', () => {
  it('maps subscription endpoints', () => {
    expect(tagSubscriptionApi.getSubscriptions()).toMatchObject({ method: 'get', url: '/tag-subscriptions' })
    expect(tagSubscriptionApi.subscribe(3)).toMatchObject({ method: 'post', url: '/tag-subscriptions/3' })
    expect(tagSubscriptionApi.unsubscribe('4')).toMatchObject({ method: 'delete', url: '/tag-subscriptions/4' })
  })
})
