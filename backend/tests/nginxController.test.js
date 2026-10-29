import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const {
  handleGenerateConfig,
  handleGenerateConfigFromStack,
  handleGenerateSslConfig,
  handleValidateConfig,
} = await import('../src/controllers/nginxController.js')

function makeRes() {
  const res = {}
  res.status = (s) => { res._status = s; return res }
  res.json   = (b) => { res._body  = b; return res }
  return res
}

describe('handleGenerateConfig — input validation', () => {
  it('returns 400 when domain is missing', async () => {
    const res = makeRes()
    await handleGenerateConfig({ body: { port: 3000 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /domain/)
  })

  it('returns 400 when port is missing', async () => {
    const res = makeRes()
    await handleGenerateConfig({ body: { domain: 'example.com' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /port/)
  })
})

describe('handleGenerateConfigFromStack — input validation', () => {
  it('returns 400 when domain is missing', async () => {
    const res = makeRes()
    await handleGenerateConfigFromStack({ body: { type: 'backend', port: 3000 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /domain/)
  })

  it('returns 400 when type is invalid', async () => {
    const res = makeRes()
    await handleGenerateConfigFromStack({ body: { domain: 'example.com', type: 'invalid' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /type/)
  })

  it('returns 400 when port is missing for backend type', async () => {
    const res = makeRes()
    await handleGenerateConfigFromStack({ body: { domain: 'example.com', type: 'backend' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /port/)
  })

  it('returns 400 when port is missing for fullstack type', async () => {
    const res = makeRes()
    await handleGenerateConfigFromStack({ body: { domain: 'example.com', type: 'fullstack' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /port/)
  })

  it('returns 200 for frontend type without port', async () => {
    const res = makeRes()
    await handleGenerateConfigFromStack({ body: { domain: 'example.com', type: 'frontend' } }, res, () => {})
    assert.equal(res._status, 200)
    assert.equal(res._body.ok, true)
  })
})

describe('handleGenerateSslConfig — input validation', () => {
  it('returns 400 when domain is missing', async () => {
    const res = makeRes()
    await handleGenerateSslConfig({ body: { port: 3000 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /domain/)
  })

  it('returns 400 when port is missing', async () => {
    const res = makeRes()
    await handleGenerateSslConfig({ body: { domain: 'example.com' } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /port/)
  })
})

describe('handleValidateConfig — input validation', () => {
  it('returns 400 when config is missing', async () => {
    const res = makeRes()
    await handleValidateConfig({ body: {} }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /config/)
  })

  it('returns 400 when config is not a string', async () => {
    const res = makeRes()
    await handleValidateConfig({ body: { config: 123 } }, res, () => {})
    assert.equal(res._status, 400)
    assert.match(res._body.error, /config/)
  })

  it('returns 200 with valid:false for invalid config', async () => {
    const res = makeRes()
    await handleValidateConfig({ body: { config: 'not a valid nginx config' } }, res, () => {})
    assert.equal(res._status, 200)
    assert.equal(res._body.ok, true)
    assert.equal(res._body.valid, false)
  })

  it('returns 200 with valid:true for valid config', async () => {
    const validConfig = `server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}`
    const res = makeRes()
    await handleValidateConfig({ body: { config: validConfig } }, res, () => {})
    assert.equal(res._status, 200)
    assert.equal(res._body.ok, true)
    assert.equal(res._body.valid, true)
  })
})
