import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isRateLimited, resetRateLimit } from '../src/utils/rateLimit.js'

describe('isRateLimited', () => {
  it('allows first request', () => {
    resetRateLimit('test-1')
    assert.equal(isRateLimited('test-1', 3, 60000), false)
  })

  it('allows requests under the limit', () => {
    resetRateLimit('test-2')
    isRateLimited('test-2', 3, 60000)
    isRateLimited('test-2', 3, 60000)
    assert.equal(isRateLimited('test-2', 3, 60000), false)
  })

  it('blocks when limit is exceeded', () => {
    resetRateLimit('test-3')
    isRateLimited('test-3', 2, 60000)
    isRateLimited('test-3', 2, 60000)
    assert.equal(isRateLimited('test-3', 2, 60000), true)
  })

  it('resets after window expires', () => {
    resetRateLimit('test-4')
    isRateLimited('test-4', 1, 1)
    return new Promise((resolve) => {
      setTimeout(() => {
        assert.equal(isRateLimited('test-4', 1, 1), false)
        resolve()
      }, 10)
    })
  })

  it('tracks different keys independently', () => {
    resetRateLimit('key-a')
    resetRateLimit('key-b')
    isRateLimited('key-a', 1, 60000)
    isRateLimited('key-a', 1, 60000)
    assert.equal(isRateLimited('key-b', 1, 60000), false)
  })
})
