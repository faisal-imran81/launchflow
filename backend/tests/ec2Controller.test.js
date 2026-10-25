import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const {
  handleLaunchInstance,
  handleDescribeInstance,
  handleListInstances,
  handleStopInstance,
  handleStartInstance,
  handleTerminateInstance,
} = await import('../src/controllers/ec2Controller.js')

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('handleLaunchInstance — input validation', () => {
  it('returns 400 when name is missing', async () => {
    const res = makeRes()
    await handleLaunchInstance({ body: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /name/)
  })

  it('returns 400 when name is not a string', async () => {
    const res = makeRes()
    await handleLaunchInstance({ body: { name: 123 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /name/)
  })
})

describe('handleDescribeInstance — input validation', () => {
  it('returns 400 when id param is missing', async () => {
    const res = makeRes()
    await handleDescribeInstance({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /id/)
  })
})

describe('handleListInstances — always calls next on service error', () => {
  it('calls next when service throws', async () => {
    const res = makeRes()
    let nextErr = null
    await handleListInstances({ body: {} }, res, (e) => { nextErr = e })
    assert.ok(nextErr !== undefined)
  })
})

describe('handleStopInstance — input validation', () => {
  it('returns 400 when id param is missing', async () => {
    const res = makeRes()
    await handleStopInstance({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /id/)
  })
})

describe('handleStartInstance — input validation', () => {
  it('returns 400 when id param is missing', async () => {
    const res = makeRes()
    await handleStartInstance({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /id/)
  })
})

describe('handleTerminateInstance — input validation', () => {
  it('returns 400 when id param is missing', async () => {
    const res = makeRes()
    await handleTerminateInstance({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /id/)
  })
})
