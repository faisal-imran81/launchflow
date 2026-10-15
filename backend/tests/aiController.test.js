import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-key'

const {
  handleGenerateDockerfile,
  handleGenerateGithubActions,
  handleAutoDockerfile,
  handleAutoGithubActions,
} = await import('../src/controllers/aiController.js')

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('aiController — input validation guards', () => {
  it('POST /dockerfile → 400 when repoName missing', async () => {
    const res = makeRes()
    let nextErr = null
    await handleGenerateDockerfile({ body: {} }, res, (e) => { nextErr = e })
    assert.equal(res._status, 400)
    assert.match(res._body.error, /repoName/)
    assert.equal(nextErr, null)
  })

  it('POST /github-actions → 400 when repoName missing', async () => {
    const res = makeRes()
    let nextErr = null
    await handleGenerateGithubActions({ body: {} }, res, (e) => { nextErr = e })
    assert.equal(res._status, 400)
    assert.match(res._body.error, /repoName/)
    assert.equal(nextErr, null)
  })

  it('POST /dockerfile/auto → 400 when owner missing', async () => {
    const res = makeRes()
    let nextErr = null
    await handleAutoDockerfile({ body: { repo: 'bar' } }, res, (e) => { nextErr = e })
    assert.equal(res._status, 400)
    assert.match(res._body.error, /owner/)
    assert.equal(nextErr, null)
  })

  it('POST /github-actions/auto → 400 when repo missing', async () => {
    const res = makeRes()
    let nextErr = null
    await handleAutoGithubActions({ body: { owner: 'foo' } }, res, (e) => { nextErr = e })
    assert.equal(res._status, 400)
    assert.match(res._body.error, /repo/)
    assert.equal(nextErr, null)
  })
})
