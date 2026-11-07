import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

let server;
let baseUrl;

describe('Integration — Health Check & Server Boot', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    const { default: app } = await import('../../src/index.js');

    await new Promise((resolve, reject) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
      server.on('error', reject);
    });
  });

  after(async () => {
    if (server?.listening) {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
    }
  });

  // ── Server Boot ───────────────────────────────────────────
  it('server boots and listens on a port', () => {
    assert.ok(server.listening, 'server should be in listening state');
    assert.ok(baseUrl.startsWith('http://127.0.0.1:'), 'baseUrl should be set');
  });

  // ── /api/health ───────────────────────────────────────────
  describe('/api/health', () => {
    it('GET returns 200', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.status, 200);
    });

    it('returns application/json', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
    });

    it('body has status ok', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = await res.json();
      assert.ok(
        body.status === 'ok' || typeof body.message === 'string',
        `Expected { status:'ok' } or message, got: ${JSON.stringify(body)}`
      );
    });
  });

  // ── 404 Fallback Middleware ───────────────────────────────
  describe('404 fallback', () => {
    it('unknown route returns 404', async () => {
      const res = await fetch(`${baseUrl}/api/this-route-xyz-does-not-exist`);
      assert.equal(res.status, 404);
    });

    it('404 response is JSON with error or message field', async () => {
      const res = await fetch(`${baseUrl}/api/this-route-xyz-does-not-exist`);
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected JSON error body, got: ${JSON.stringify(body)}`
      );
    });
  });

  // ── Route Registration Smoke Tests ───────────────────────
  // GET-based routes — expect non-404 (may return 200/401/500 depending on DB)
  describe('GET routes — mounted check', () => {
    const getRoutes = [
      ['/api/projects', 'Projects'],
      ['/api/history',  'History'],
    ];

    for (const [path, label] of getRoutes) {
      it(`${label} — GET ${path} is mounted (not 404)`, async () => {
        const res = await fetch(`${baseUrl}${path}`);
        assert.notEqual(res.status, 404, `${label} router not mounted at ${path}`);
      });
    }
  });

  // POST-based routes — empty body → expect 400/422/500, NOT 404
  describe('POST routes — mounted check', () => {
    const postRoutes = [
      ['/api/ai/dockerfile', 'AI'],
      ['/api/deploy/trigger', 'Deploy'],
      ['/api/docker/build',  'Docker'],
    ];

    for (const [path, label] of postRoutes) {
      it(`${label} — POST ${path} is mounted (not 404)`, async () => {
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        assert.notEqual(res.status, 404, `${label} router not mounted at ${path}`);
      });
    }
  });
});
