import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer } from './helpers/startServer.js';

let server;
let baseUrl;

describe('Integration — Deploy Flow', () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
  });

  after(async () => {
    await stopTestServer(server);
  });

  // ── POST /api/deploy/trigger ───────────────────────────────
  describe('POST /api/deploy/trigger', () => {
    it('missing body returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx, got ${res.status}`
      );
    });

    it('missing repoUrl returns structured error', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: 'test-app', environment: 'production' }),
      });
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });

    it('missing appName/environment returns structured error', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 'https://github.com/test/repo' }),
      });
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });

    it('malformed JSON returns 400 not 500', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ bad json :::',
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for malformed JSON, got ${res.status}`
      );
    });

    it('error response is JSON not HTML', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
    });

    it('null deploymentId does not crash server', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: 'https://github.com/test/repo',
          deploymentId: null,
        }),
      });
      // server should handle null deploymentId gracefully — not 500 with HTML
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Crash on null deploymentId, got: ${ct}`);
    });
  });

  // ── GET /api/status/:deploymentId ─────────────────────────
  describe('GET /api/status/:deploymentId', () => {
    it('invalid deploymentId returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/status/!!!invalid!!!`);
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for invalid deploymentId, got ${res.status}`
      );
    });

    it('invalid deploymentId error response is JSON', async () => {
      const res = await fetch(`${baseUrl}/api/status/!!!invalid!!!`);
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
    });

    it('non-existent UUID returns structured error', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const res = await fetch(`${baseUrl}/api/status/${fakeUuid}`);
      assert.ok(
        res.status >= 400 && res.status < 600,
        `Expected an error status for non-existent deployment, got ${res.status}`
      );
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });
  });

  // ── Route Registration ─────────────────────────────────────
  describe('Route registration', () => {
    it('POST /api/deploy/trigger is mounted (not 404)', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.notEqual(res.status, 404, '/api/deploy/trigger not mounted');
    });

    it('GET /api/status/:id is mounted (not 404)', async () => {
      const res = await fetch(`${baseUrl}/api/status/test-id`);
      assert.notEqual(res.status, 404, '/api/status/:id not mounted');
    });
  });
});
