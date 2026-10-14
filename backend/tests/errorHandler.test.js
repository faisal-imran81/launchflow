import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { errorHandler } from '../src/middleware/errorHandler.js'

const mockReq = {}
const mockNext = () => {}

function mockRes() {
  const res = { _status: 0, _body: null }
  res.status = (s) => { res._status = s; return res }
  res.json = (b) => { res._body = b; return res }
  return res
}

describe('errorHandler middleware', () => {
  it('returns 500 with message when no status on err', () => {
    const res = mockRes()
    errorHandler(new Error('boom'), mockReq, res, mockNext)
    assert.equal(res._status, 500)
    assert.equal(res._body.success, false)
    assert.equal(res._body.error, 'boom')
  })

  it('uses err.status when provided', () => {
    const res = mockRes()
    const err = Object.assign(new Error('Not Found'), { status: 404 })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._status, 404)
  })

  it('includes err.code in response when present', () => {
    const res = mockRes()
    const err = Object.assign(new Error('Rate limited'), { status: 429, code: 'ai/rate-limited' })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._status, 429)
    assert.equal(res._body.code, 'ai/rate-limited')
  })

  it('omits code field when err.code is absent', () => {
    const res = mockRes()
    errorHandler(new Error('plain error'), mockReq, res, mockNext)
    assert.ok(!('code' in res._body))
  })

  it('falls back to Internal Server Error when no message', () => {
    const res = mockRes()
    errorHandler({}, mockReq, res, mockNext)
    assert.equal(res._body.error, 'Internal Server Error')
  })
})
