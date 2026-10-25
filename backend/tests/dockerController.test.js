import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const {
  handleBuildImage,
  handleListImages,
  handleRemoveImage,
  handleRunContainer,
  handleStopContainer,
  handleRemoveContainer,
  handleGetContainerLogs,
} = await import('../src/controllers/dockerController.js')

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('handleBuildImage — input validation', () => {
  it('returns 400 when dockerfileContent is missing', async () => {
    const res = makeRes()
    await handleBuildImage({ body: { tag: 'myapp:latest' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /dockerfileContent/)
  })

  it('returns 400 when tag is missing', async () => {
    const res = makeRes()
    await handleBuildImage({ body: { dockerfileContent: 'FROM node:20' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /tag/)
  })
})

describe('handleRemoveImage — input validation', () => {
  it('returns 400 when tag param is missing', async () => {
    const res = makeRes()
    await handleRemoveImage({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /tag/)
  })
})

describe('handleRunContainer — input validation', () => {
  it('returns 400 when imageTag is missing', async () => {
    const res = makeRes()
    await handleRunContainer({ body: { hostPort: 3000, containerPort: 3000 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /imageTag/)
  })

  it('returns 400 when hostPort is missing', async () => {
    const res = makeRes()
    await handleRunContainer({ body: { imageTag: 'myapp:latest', containerPort: 3000 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /hostPort/)
  })

  it('returns 400 when containerPort is missing', async () => {
    const res = makeRes()
    await handleRunContainer({ body: { imageTag: 'myapp:latest', hostPort: 3000 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /hostPort/)
  })
})

describe('handleStopContainer — input validation', () => {
  it('returns 400 when id param is missing', async () => {
    const res = makeRes()
    await handleStopContainer({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /id/)
  })
})

describe('handleRemoveContainer — input validation', () => {
  it('returns 400 when id param is missing', async () => {
    const res = makeRes()
    await handleRemoveContainer({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /id/)
  })
})

describe('handleGetContainerLogs — input validation', () => {
  it('returns 400 when id param is missing', async () => {
    const res = makeRes()
    await handleGetContainerLogs({ params: {}, query: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /id/)
  })

  it('returns 400 when tail is not a positive integer', async () => {
    const res = makeRes()
    await handleGetContainerLogs({ params: { id: 'abc123' }, query: { tail: 'bad' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /tail/)
  })
})
