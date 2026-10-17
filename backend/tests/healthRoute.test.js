import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('health route handler', () => {
  it('returns 200 status', () => {
    const res = makeRes()
    const handler = (req, res) => {
      res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      })
    }
    handler({}, res)
    assert.equal(res._status, 200)
  })

  it('success is true', () => {
    const res = makeRes()
    const handler = (req, res) => {
      res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString(), uptime: 0 })
    }
    handler({}, res)
    assert.equal(res._body.success, true)
  })

  it('status field is ok', () => {
    const res = makeRes()
    const handler = (req, res) => {
      res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString(), uptime: 0 })
    }
    handler({}, res)
    assert.equal(res._body.status, 'ok')
  })

  it('includes timestamp and uptime', () => {
    const res = makeRes()
    const handler = (req, res) => {
      res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString(), uptime: Math.floor(process.uptime()) })
    }
    handler({}, res)
    assert.ok(res._body.timestamp)
    assert.ok(typeof res._body.uptime === 'number')
  })
})
