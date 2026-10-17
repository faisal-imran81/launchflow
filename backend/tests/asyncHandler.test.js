import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { asyncHandler } from '../src/utils/asyncHandler.js'

describe('asyncHandler', () => {
  it('calls the handler with req, res, next', async () => {
    let called = false
    const handler = asyncHandler(async (req, res, next) => { called = true })
    await handler({}, {}, () => {})
    assert.equal(called, true)
  })

  it('forwards async errors to next()', async () => {
    const err = new Error('async boom')
    const handler = asyncHandler(async () => { throw err })
    let nextErr = null
    await handler({}, {}, (e) => { nextErr = e })
    assert.equal(nextErr, err)
  })

  it('forwards sync errors to next()', async () => {
    const err = new Error('sync boom')
    const handler = asyncHandler(() => { throw err })
    let nextErr = null
    await handler({}, {}, (e) => { nextErr = e })
    assert.equal(nextErr, err)
  })

  it('does not call next when handler resolves cleanly', async () => {
    let nextCalled = false
    const handler = asyncHandler(async (req, res) => {})
    await handler({}, {}, () => { nextCalled = true })
    assert.equal(nextCalled, false)
  })
})
