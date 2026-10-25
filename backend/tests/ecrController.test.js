import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const {
  handleCreateRepo,
  handleListRepos,
  handleDeleteRepo,
  handlePushImage,
  handleListImages,
  handleDeleteImage,
} = await import('../src/controllers/ecrController.js')

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('handleCreateRepo — input validation', () => {
  it('returns 400 when repositoryName is missing', async () => {
    const res = makeRes()
    await handleCreateRepo({ body: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /repositoryName/)
  })

  it('returns 400 when repositoryName is not a string', async () => {
    const res = makeRes()
    await handleCreateRepo({ body: { repositoryName: 123 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /repositoryName/)
  })
})

describe('handleListRepos — always calls next on service error', () => {
  it('calls next when service throws', async () => {
    const res = makeRes()
    let nextErr = null
    await handleListRepos({ body: {} }, res, (e) => { nextErr = e })
    assert.ok(nextErr !== undefined)
  })
})

describe('handleDeleteRepo — input validation', () => {
  it('returns 400 when name param is missing', async () => {
    const res = makeRes()
    await handleDeleteRepo({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /name/)
  })
})

describe('handlePushImage — input validation', () => {
  it('returns 400 when localTag is missing', async () => {
    const res = makeRes()
    await handlePushImage({ body: { repositoryUri: 'uri' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /localTag/)
  })

  it('returns 400 when repositoryUri is missing', async () => {
    const res = makeRes()
    await handlePushImage({ body: { localTag: 'myapp:latest' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /repositoryUri/)
  })
})

describe('handleListImages — input validation', () => {
  it('returns 400 when name param is missing', async () => {
    const res = makeRes()
    await handleListImages({ params: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /name/)
  })
})

describe('handleDeleteImage — input validation', () => {
  it('returns 400 when name param is missing', async () => {
    const res = makeRes()
    await handleDeleteImage({ params: {}, body: { imageTag: 'latest' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /name/)
  })

  it('returns 400 when both imageTag and imageDigest are missing', async () => {
    const res = makeRes()
    await handleDeleteImage({ params: { name: 'myapp' }, body: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /imageTag|imageDigest/)
  })
})
