import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { notFound } from '../src/middleware/notFound.js'

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('notFound middleware', () => {
  it('returns 404 status', () => {
    const res = makeRes()
    notFound({ method: 'GET', originalUrl: '/api/unknown' }, res)
    assert.equal(res._status, 404)
  })

  it('success is false', () => {
    const res = makeRes()
    notFound({ method: 'GET', originalUrl: '/api/unknown' }, res)
    assert.equal(res._body.success, false)
  })

  it('includes method and url in error message', () => {
    const res = makeRes()
    notFound({ method: 'POST', originalUrl: '/api/fake' }, res)
    assert.ok(res._body.error.includes('POST'))
    assert.ok(res._body.error.includes('/api/fake'))
  })

  it('includes not-found code', () => {
    const res = makeRes()
    notFound({ method: 'DELETE', originalUrl: '/api/nothing' }, res)
    assert.equal(res._body.code, 'not-found')
  })
})
