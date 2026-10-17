import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { requestLogger } from '../src/middleware/requestLogger.js'

describe('requestLogger middleware', () => {
  it('calls next()', () => {
    let called = false
    const req = { method: 'GET', originalUrl: '/api/test' }
    const res = { on: () => {} }
    requestLogger(req, res, () => { called = true })
    assert.equal(called, true)
  })

  it('registers finish event on res', () => {
    let eventName = null
    const req = { method: 'GET', originalUrl: '/api/test' }
    const res = { on: (name) => { eventName = name } }
    requestLogger(req, res, () => {})
    assert.equal(eventName, 'finish')
  })
})
