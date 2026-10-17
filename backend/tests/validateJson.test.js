import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateJson } from '../src/middleware/validateJson.js'

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('validateJson middleware', () => {
  it('returns 400 when JSON parse fails', () => {
    const res = makeRes()
    const err = { type: 'entity.parse.failed' }
    validateJson(err, {}, res, () => {})
    assert.equal(res._status, 400)
    assert.equal(res._body.success, false)
    assert.equal(res._body.code, 'bad-request/invalid-json')
  })

  it('calls next(err) for non-JSON errors', () => {
    const res = makeRes()
    const err = { type: 'some.other.error' }
    let nextErr = null
    validateJson(err, {}, res, (e) => { nextErr = e })
    assert.deepEqual(nextErr, err)
  })

  it('error message mentions JSON', () => {
    const res = makeRes()
    validateJson({ type: 'entity.parse.failed' }, {}, res, () => {})
    assert.ok(res._body.error.toLowerCase().includes('json'))
  })
})
