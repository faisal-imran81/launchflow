import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateNginxConfig } from '../src/utils/validateNginxConfig.js'

describe('validateNginxConfig — invalid input', () => {
  it('returns error for empty string', () => {
    const { errors } = validateNginxConfig('')
    assert.ok(errors.length > 0)
  })

  it('returns error for null input', () => {
    const { errors } = validateNginxConfig(null)
    assert.ok(errors.length > 0)
  })

  it('returns error for non-string input', () => {
    const { errors } = validateNginxConfig(42)
    assert.ok(errors.length > 0)
  })
})

describe('validateNginxConfig — missing required directives', () => {
  it('errors when server block is missing', () => {
    const config = 'listen 80;\nserver_name example.com;\nlocation / {}'
    const { errors } = validateNginxConfig(config)
    assert.ok(errors.some((e) => /server block/i.test(e)))
  })

  it('errors when listen directive is missing', () => {
    const config = 'server {\n  server_name example.com;\n  location / {}\n}'
    const { errors } = validateNginxConfig(config)
    assert.ok(errors.some((e) => /listen/i.test(e)))
  })

  it('errors when server_name directive is missing', () => {
    const config = 'server {\n  listen 80;\n  location / {}\n}'
    const { errors } = validateNginxConfig(config)
    assert.ok(errors.some((e) => /server_name/i.test(e)))
  })

  it('errors when location block is missing', () => {
    const config = 'server {\n  listen 80;\n  server_name example.com;\n}'
    const { errors } = validateNginxConfig(config)
    assert.ok(errors.some((e) => /location/i.test(e)))
  })
})

describe('validateNginxConfig — SSL checks', () => {
  it('errors when ssl_certificate is missing on port 443', () => {
    const config = `server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate_key /etc/ssl/key.pem;
    location / { proxy_pass http://localhost:3000; }
}`
    const { errors } = validateNginxConfig(config)
    assert.ok(errors.some((e) => /ssl_certificate/i.test(e)))
  })

  it('errors when ssl_certificate_key is missing on port 443', () => {
    const config = `server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate /etc/ssl/cert.pem;
    location / { proxy_pass http://localhost:3000; }
}`
    const { errors } = validateNginxConfig(config)
    assert.ok(errors.some((e) => /ssl_certificate_key/i.test(e)))
  })

  it('warns when ssl_protocols is missing on port 443', () => {
    const config = `server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;
    location / { proxy_pass http://localhost:3000; }
}`
    const { warnings } = validateNginxConfig(config)
    assert.ok(warnings.some((w) => /ssl_protocols/i.test(w)))
  })
})

describe('validateNginxConfig — proxy_pass warnings', () => {
  it('warns when proxy_set_header Host is missing', () => {
    const config = `server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
    }
}`
    const { warnings } = validateNginxConfig(config)
    assert.ok(warnings.some((w) => /Host/i.test(w)))
  })

  it('warns when proxy_http_version 1.1 is missing', () => {
    const config = `server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}`
    const { warnings } = validateNginxConfig(config)
    assert.ok(warnings.some((w) => /proxy_http_version/i.test(w)))
  })
})

describe('validateNginxConfig — other warnings', () => {
  it('warns when HTTP to HTTPS redirect is missing', () => {
    const config = `server {
    listen 80;
    server_name example.com;
    location / {}
}
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;
    location / {}
}`
    const { warnings } = validateNginxConfig(config)
    assert.ok(warnings.some((w) => /redirect/i.test(w)))
  })

  it('warns when server_name is catch-all _', () => {
    const config = `server {
    listen 80;
    server_name _;
    location / { proxy_pass http://localhost:3000; }
}`
    const { warnings } = validateNginxConfig(config)
    assert.ok(warnings.some((w) => /catch-all/i.test(w)))
  })

  it('warns when try_files is missing in static file server', () => {
    const config = `server {
    listen 80;
    server_name example.com;
    root /usr/share/nginx/html;
    location / {}
}`
    const { warnings } = validateNginxConfig(config)
    assert.ok(warnings.some((w) => /try_files/i.test(w)))
  })
})

describe('validateNginxConfig — valid config passes', () => {
  it('returns no errors for a valid reverse proxy config', () => {
    const config = `server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`
    const { errors } = validateNginxConfig(config)
    assert.equal(errors.length, 0)
  })
})
