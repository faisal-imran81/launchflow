import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer } from './helpers/startServer.js';

let server;
let baseUrl;

describe('Integration — AI Flow', () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
  });

  after(async () => {
    await stopTestServer(server);
  });

  // ── Dockerfile Generation ─────────────────────────────────
  describe('POST /api/ai/dockerfile', () => {
    it('missing body returns 400', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for empty body, got ${res.status}`
      );
    });

    it('missing repoName field returns structured error', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'node' }),
      });
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });

    it('missing repoName field returns structured error (stack only)', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack: 'node' }),
      });
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });

    it('malformed JSON returns 400 not 500', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ bad json :::',
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for malformed JSON, got ${res.status}`
      );
    });

    it('error response is always JSON not HTML', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(
        ct.includes('application/json'),
        `Expected JSON content-type, got: ${ct}`
      );
    });
  });

  // ── Workflow YAML Generation ───────────────────────────────
  describe('POST /api/ai/github-actions', () => {
    it('missing body returns 400', async () => {
      const res = await fetch(`${baseUrl}/api/ai/github-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for empty body, got ${res.status}`
      );
    });

    it('missing repoName field returns structured error', async () => {
      const res = await fetch(`${baseUrl}/api/ai/github-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'node' }),
      });
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });

    it('malformed JSON returns 400 not 500', async () => {
      const res = await fetch(`${baseUrl}/api/ai/github-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ bad json :::',
      });
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for malformed JSON, got ${res.status}`
      );
    });

    it('error response is always JSON not HTML', async () => {
      const res = await fetch(`${baseUrl}/api/ai/github-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(
        ct.includes('application/json'),
        `Expected JSON content-type, got: ${ct}`
      );
    });
  });

  // ── Route Registration ─────────────────────────────────────
  describe('Route registration', () => {
    it('POST /api/ai/dockerfile is mounted (not 404)', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dockerfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.notEqual(res.status, 404, '/api/ai/dockerfile not mounted');
    });

    it('POST /api/ai/github-actions is mounted (not 404)', async () => {
      const res = await fetch(`${baseUrl}/api/ai/github-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.notEqual(res.status, 404, '/api/ai/github-actions not mounted');
    });
  });
});
