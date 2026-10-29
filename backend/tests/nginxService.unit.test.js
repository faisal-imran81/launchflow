import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateNginxConfig,
  generateNginxConfigFromStack,
  generateSslConfig,
} from '../src/services/nginxService.js'

// ─── generateNginxConfig ─────────────────────────────────────────────────────

describe('generateNginxConfig — input validation', () => {
  it('throws nginx/invalid-input when domain is missing', () => {
    assert.throws(
      () => generateNginxConfig({ port: 3000 }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })

  it('throws nginx/invalid-input when port is missing', () => {
    assert.throws(
      () => generateNginxConfig({ domain: 'example.com' }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })

  it('throws nginx/invalid-input when port is out of range', () => {
    assert.throws(
      () => generateNginxConfig({ domain: 'example.com', port: 99999 }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })

  it('throws nginx/invalid-input when port is not a number', () => {
    assert.throws(
      () => generateNginxConfig({ domain: 'example.com', port: 'bad' }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })
})

describe('generateNginxConfig — success', () => {
  it('returns config containing domain and port', () => {
    const { config } = generateNginxConfig({ domain: 'example.com', port: 3000 })
    assert.ok(config.includes('server_name example.com'))
    assert.ok(config.includes('proxy_pass http://localhost:3000'))
    assert.ok(config.includes('listen 80'))
  })

  it('includes appName in config comment', () => {
    const { config } = generateNginxConfig({ domain: 'example.com', port: 3000, appName: 'myapp' })
    assert.ok(config.includes('myapp'))
  })
})

// ─── generateNginxConfigFromStack ────────────────────────────────────────────

describe('generateNginxConfigFromStack — input validation', () => {
  it('throws nginx/invalid-input when domain is missing', () => {
    assert.throws(
      () => generateNginxConfigFromStack({ type: 'backend', port: 3000 }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })

  it('throws nginx/invalid-input when type is invalid', () => {
    assert.throws(
      () => generateNginxConfigFromStack({ domain: 'example.com', type: 'invalid' }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })

  it('throws nginx/invalid-input when port is missing for backend', () => {
    assert.throws(
      () => generateNginxConfigFromStack({ domain: 'example.com', type: 'backend' }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })

  it('throws nginx/invalid-input when port is missing for fullstack', () => {
    assert.throws(
      () => generateNginxConfigFromStack({ domain: 'example.com', type: 'fullstack' }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })
})

describe('generateNginxConfigFromStack — frontend', () => {
  it('returns static file server config with try_files', () => {
    const { config } = generateNginxConfigFromStack({ domain: 'example.com', type: 'frontend' })
    assert.ok(config.includes('try_files'))
    assert.ok(config.includes('root'))
    assert.ok(config.includes('index.html'))
  })

  it('uses custom buildOutput in root path', () => {
    const { config } = generateNginxConfigFromStack({
      domain: 'example.com',
      type: 'frontend',
      buildOutput: 'build',
    })
    assert.ok(config.includes('build'))
  })
})

describe('generateNginxConfigFromStack — backend', () => {
  it('returns reverse proxy config with proxy_pass', () => {
    const { config } = generateNginxConfigFromStack({
      domain: 'example.com',
      type: 'backend',
      port: 4000,
    })
    assert.ok(config.includes('proxy_pass http://localhost:4000'))
    assert.ok(config.includes('listen 80'))
  })
})

describe('generateNginxConfigFromStack — fullstack', () => {
  it('returns config with /api/ proxy and SPA fallback', () => {
    const { config } = generateNginxConfigFromStack({
      domain: 'example.com',
      type: 'fullstack',
      port: 5000,
    })
    assert.ok(config.includes('location /api/'))
    assert.ok(config.includes('proxy_pass http://localhost:5000'))
    assert.ok(config.includes('try_files'))
  })
})

// ─── generateSslConfig ───────────────────────────────────────────────────────

describe('generateSslConfig — input validation', () => {
  it('throws nginx/invalid-input when domain is missing', () => {
    assert.throws(
      () => generateSslConfig({ port: 3000 }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })

  it('throws nginx/invalid-input when port is missing', () => {
    assert.throws(
      () => generateSslConfig({ domain: 'example.com' }),
      (err) => { assert.equal(err.code, 'nginx/invalid-input'); return true }
    )
  })
})

describe('generateSslConfig — success', () => {
  it('returns config with listen 443 ssl and HTTP redirect', () => {
    const { config } = generateSslConfig({ domain: 'example.com', port: 3000 })
    assert.ok(config.includes('listen 443 ssl'))
    assert.ok(config.includes('listen 80'))
    assert.ok(config.includes('return 301'))
    assert.ok(config.includes('ssl_certificate'))
    assert.ok(config.includes('ssl_certificate_key'))
  })

  it('uses Let\'s Encrypt default cert paths when not specified', () => {
    const { config } = generateSslConfig({ domain: 'example.com', port: 3000 })
    assert.ok(config.includes('/etc/letsencrypt/live/example.com/fullchain.pem'))
    assert.ok(config.includes('/etc/letsencrypt/live/example.com/privkey.pem'))
  })

  it('uses custom cert and key paths when specified', () => {
    const { config } = generateSslConfig({
      domain: 'example.com',
      port: 3000,
      certPath: '/custom/cert.pem',
      keyPath: '/custom/key.pem',
    })
    assert.ok(config.includes('/custom/cert.pem'))
    assert.ok(config.includes('/custom/key.pem'))
  })

  it('includes strong SSL settings', () => {
    const { config } = generateSslConfig({ domain: 'example.com', port: 3000 })
    assert.ok(config.includes('ssl_protocols TLSv1.2 TLSv1.3'))
    assert.ok(config.includes('Strict-Transport-Security'))
  })
})
