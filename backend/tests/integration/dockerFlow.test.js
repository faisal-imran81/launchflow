import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer } from './helpers/startServer.js';

let server;
let baseUrl;

describe('Integration — Docker Flow', () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
  });

  after(async () => {
    await stopTestServer(server);
  });

  // ── Build ──────────────────────────────────────────────────
  describe('POST /api/docker/build', () => {
    it('missing body returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/docker/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx, got ${res.status}`
      );
    });

    it('missing dockerfileContent returns structured error', async () => {
      const res = await fetch(`${baseUrl}/api/docker/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: 'my-app:latest' }),
      });
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });

    it('malformed JSON returns 400 not 500', async () => {
      const res = await fetch(`${baseUrl}/api/docker/build`, {
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
      const res = await fetch(`${baseUrl}/api/docker/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
    });
  });

  // ── Run ───────────────────────────────────────────────────
  describe('POST /api/docker/containers/run', () => {
    it('missing body returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/docker/containers/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx, got ${res.status}`
      );
    });

    it('missing imageTag returns structured error', async () => {
      const res = await fetch(`${baseUrl}/api/docker/containers/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test-container' }),
      });
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });

    it('error response is JSON not HTML', async () => {
      const res = await fetch(`${baseUrl}/api/docker/containers/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
    });
  });

  // ── Stop ──────────────────────────────────────────────────
  describe('POST /api/docker/containers/:id/stop', () => {
    it('missing containerId returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/docker/containers/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx, got ${res.status}`
      );
    });

    it('error response is JSON not HTML', async () => {
      const res = await fetch(`${baseUrl}/api/docker/containers/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
    });
  });

  // ── Daemon Unreachable Guard ───────────────────────────────
  describe('Docker daemon guard', () => {
    it('build with invalid image name returns structured error not crash', async () => {
      const res = await fetch(`${baseUrl}/api/docker/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dockerfileContent: 'FROM node:20-alpine',
          tag: '!!!invalid_image_name!!!',
        }),
      });
      // should never be an unhandled crash (500 with HTML)
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Crash response detected, got: ${ct}`);
    });
  });

  // ── Route Registration ─────────────────────────────────────
  describe('Route registration', () => {
    const routes = [
      '/api/docker/build',
      '/api/docker/containers/run',
      '/api/docker/containers/test-id/stop',
    ];

    for (const path of routes) {
      it(`POST ${path} is mounted (not 404)`, async () => {
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const body = await res.json().catch(() => ({}));
        const genericNotFound = res.status === 404 && body.code === 'not-found';
        assert.ok(!genericNotFound, `${path} not mounted`);
      });
    }
  });
});
