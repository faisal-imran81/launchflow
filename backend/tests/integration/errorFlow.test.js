import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer } from './helpers/startServer.js';

let server;
let baseUrl;

describe('Integration — Error Flow (All Error Paths)', () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
  });

  after(async () => {
    await stopTestServer(server);
  });

  // ── Malformed JSON ─────────────────────────────────────────
  describe('Malformed JSON — all POST routes', () => {
    const postRoutes = [
      '/api/ai/dockerfile',
      '/api/ai/github-actions',
      '/api/deploy/trigger',
      '/api/docker/build',
      '/api/docker/containers/run',
      '/api/docker/containers/stop',
    ];

    for (const path of postRoutes) {
      it(`POST ${path} — malformed JSON returns 400 not 500`, async () => {
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{ bad json :::',
        });
        assert.ok(
          res.status >= 400 && res.status < 500,
          `Expected 4xx for malformed JSON on ${path}, got ${res.status}`
        );
      });

      it(`POST ${path} — malformed JSON response is JSON not HTML`, async () => {
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{ bad json :::',
        });
        const ct = res.headers.get('content-type') ?? '';
        assert.ok(
          ct.includes('application/json'),
          `Expected JSON content-type on ${path}, got: ${ct}`
        );
      });
    }
  });

  // ── Empty Body ─────────────────────────────────────────────
  describe('Empty body — all POST routes', () => {
    const postRoutes = [
      '/api/ai/dockerfile',
      '/api/ai/github-actions',
      '/api/deploy/trigger',
      '/api/docker/build',
      '/api/docker/containers/run',
      '/api/docker/containers/stop',
    ];

    for (const path of postRoutes) {
      it(`POST ${path} — empty body returns structured error`, async () => {
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        assert.ok(
          res.status >= 400 && res.status < 500,
          `Expected 4xx for empty body on ${path}, got ${res.status}`
        );
        const body = await res.json();
        assert.ok(
          body.error || body.message,
          `Expected error field on ${path}, got: ${JSON.stringify(body)}`
        );
      });
    }
  });

  // ── Invalid UUID — SSE routes ──────────────────────────────
  describe('Invalid UUID — SSE routes', () => {
    const sseRoutes = [
      '/api/logs/!!!invalid!!!/stream',
      '/api/status/!!!invalid!!!',
    ];

    for (const path of sseRoutes) {
      it(`GET ${path} — invalid UUID returns 4xx not 500`, async () => {
        const res = await fetch(`${baseUrl}${path}`);
        assert.ok(
          res.status >= 400 && res.status < 500,
          `Expected 4xx for invalid UUID on ${path}, got ${res.status}`
        );
      });

      it(`GET ${path} — invalid UUID error is JSON not HTML`, async () => {
        const res = await fetch(`${baseUrl}${path}`);
        const ct = res.headers.get('content-type') ?? '';
        assert.ok(
          ct.includes('application/json'),
          `Expected JSON on ${path}, got: ${ct}`
        );
      });

      it(`GET ${path} — invalid UUID error body is structured`, async () => {
        const res = await fetch(`${baseUrl}${path}`);
        const body = await res.json();
        assert.ok(
          body.error || body.message,
          `Expected error field on ${path}, got: ${JSON.stringify(body)}`
        );
      });
    }
  });

  // ── 404 Fallback ───────────────────────────────────────────
  describe('404 fallback — unknown routes', () => {
    const unknownRoutes = [
      '/api/unknown',
      '/api/ai/unknown-endpoint',
      '/api/deploy/unknown-endpoint',
      '/api/docker/unknown-endpoint',
    ];

    for (const path of unknownRoutes) {
      it(`GET ${path} — returns 404`, async () => {
        const res = await fetch(`${baseUrl}${path}`);
        assert.equal(res.status, 404, `Expected 404 on ${path}`);
      });

      it(`GET ${path} — 404 body is structured JSON`, async () => {
        const res = await fetch(`${baseUrl}${path}`);
        const body = await res.json();
        assert.ok(
          body.error || body.message,
          `Expected error field on ${path}, got: ${JSON.stringify(body)}`
        );
      });
    }
  });

  // ── No crash on extreme inputs ─────────────────────────────
  describe('Extreme inputs — server must not crash', () => {
    it('very long repoUrl does not crash server', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: 'https://github.com/' + 'a'.repeat(5000),
          stack: 'node',
        }),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(
        ct.includes('application/json'),
        `Server crashed on long repoUrl, got: ${ct}`
      );
    });

    it('null values in body do not crash server', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: null, stack: null, files: null }),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(
        ct.includes('application/json'),
        `Server crashed on null body values, got: ${ct}`
      );
    });

    it('numeric values in body do not crash server', async () => {
      const res = await fetch(`${baseUrl}/api/deploy/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: 12345, stack: 99 }),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(
        ct.includes('application/json'),
        `Server crashed on numeric body values, got: ${ct}`
      );
    });
  });
});
