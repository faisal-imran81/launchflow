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
  it('hides the message of unexpected 500 errors', () => {
    const res = mockRes()
    errorHandler(new Error('boom'), mockReq, res, mockNext)
    assert.equal(res._status, 500)
    assert.equal(res._body.success, false)
    assert.equal(res._body.error, 'Internal Server Error')
  })

  it('keeps the message of client errors (4xx)', () => {
    const res = mockRes()
    const err = Object.assign(new Error('Not Found'), { status: 404 })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._status, 404)
    assert.equal(res._body.error, 'Not Found')
  })

  it('keeps the message of AI errors even when the status is 500', () => {
    const res = mockRes()
    const err = Object.assign(new Error('The AI model is currently unavailable.'), {
      status: 500,
      isAiError: true,
    })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._status, 500)
    assert.equal(res._body.error, 'The AI model is currently unavailable.')
  })

  it('includes err.code for client errors', () => {
    const res = mockRes()
    const err = Object.assign(new Error('Rate limited'), { status: 429, code: 'ai/rate-limited' })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._status, 429)
    assert.equal(res._body.code, 'ai/rate-limited')
  })

  it('forwards err.code for AI errors with status 500', () => {
    const res = mockRes()
    const err = Object.assign(new Error('Unavailable'), {
      status: 500,
      isAiError: true,
      code: 'ai/auth-failed',
    })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._body.code, 'ai/auth-failed')
  })

  it('does not forward err.code for unexpected 500 errors', () => {
    const res = mockRes()
    const err = Object.assign(new Error('db down'), { code: 'ECONNREFUSED' })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._status, 500)
    assert.ok(!('code' in res._body))
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

  it('keeps a 4xx message and never touches the status code', () => {
    const res = mockRes()
    const err = Object.assign(new Error('Bad input'), { status: 400 })
    errorHandler(err, mockReq, res, mockNext)
    assert.equal(res._status, 400)
    assert.equal(res._body.error, 'Bad input')
  })
})
