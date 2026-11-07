import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer } from './helpers/startServer.js';

let server;
let baseUrl;

// Valid UUID format for testing
const FAKE_UUID = '00000000-0000-0000-0000-000000000099';
const INVALID_ID = '!!!invalid!!!';

describe('Integration — Deployment Status Flow', () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
  });

  after(async () => {
    await stopTestServer(server);
  });

  // ── GET /api/status/:deploymentId ─────────────────────────
  describe('GET /api/status/:deploymentId — input validation', () => {
    it('invalid UUID returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/status/${INVALID_ID}`);
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for invalid UUID, got ${res.status}`
      );
    });

    it('invalid UUID response is JSON not HTML', async () => {
      const res = await fetch(`${baseUrl}/api/status/${INVALID_ID}`);
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(
        ct.includes('application/json'),
        `Expected JSON, got: ${ct}`
      );
    });

    it('invalid UUID error body has error or message field', async () => {
      const res = await fetch(`${baseUrl}/api/status/${INVALID_ID}`);
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected structured error, got: ${JSON.stringify(body)}`
      );
    });

    it('non-existent valid UUID returns structured error', async () => {
      const res = await fetch(`${baseUrl}/api/status/${FAKE_UUID}`);
      assert.ok(
        res.status >= 400 && res.status < 600,
        `Expected an error status, got ${res.status}`
      );
    });

    it('non-existent UUID error body is structured', async () => {
      const res = await fetch(`${baseUrl}/api/status/${FAKE_UUID}`);
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected error field, got: ${JSON.stringify(body)}`
      );
    });
  });

  // ── Status Enum Validation ─────────────────────────────────
  describe('Status values — enum guard', () => {
    it('status endpoint never returns unknown status string on valid UUID', async () => {
      const res = await fetch(`${baseUrl}/api/status/${FAKE_UUID}`);
      // if 200, status value must be one of the known enum values
      if (res.status === 200) {
        const body = await res.json();
        const validStatuses = [
          'queued',
          'building',
          'pushing',
          'deploying',
          'running',
          'failed',
          'stopped',
        ];
        assert.ok(
          validStatuses.includes(body.status),
          `Unknown status value: ${body.status}`
        );
      } else {
        // Any error status is also valid for non-existent deployment
        assert.ok(res.status >= 400 && res.status < 600);
      }
    });
  });

  // ── SSE Status Stream ──────────────────────────────────────
  describe('GET /api/status/:deploymentId/stream — SSE', () => {
    it('invalid UUID returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/status/${INVALID_ID}/stream`);
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for invalid UUID, got ${res.status}`
      );
    });

    it('valid UUID opens SSE stream with text/event-stream', async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 500);

      try {
        const res = await fetch(
          `${baseUrl}/api/status/${FAKE_UUID}/stream`,
          { signal: controller.signal }
        );
        const ct = res.headers.get('content-type') ?? '';
        assert.ok(
          ct.includes('text/event-stream'),
          `Expected text/event-stream, got: ${ct}`
        );
      } catch (err) {
        if (err.name !== 'AbortError') throw err;
      } finally {
        clearTimeout(timeout);
      }
    });

    it('SSE status stream sends at least one data event', async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);

      let receivedData = false;

      try {
        const res = await fetch(
          `${baseUrl}/api/status/${FAKE_UUID}/stream`,
          { signal: controller.signal }
        );
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          if (chunk.includes('data:')) {
            receivedData = true;
            break;
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') throw err;
      } finally {
        clearTimeout(timeout);
      }

      assert.ok(receivedData, 'SSE status stream should send at least one data: event');
    });
  });

  // ── Route Registration ─────────────────────────────────────
  describe('Route registration', () => {
    it('GET /api/status/:id is mounted (not 404)', async () => {
      const res = await fetch(`${baseUrl}/api/status/${FAKE_UUID}`);
      assert.notEqual(res.status, 404, '/api/status/:id not mounted');
    });

    it('GET /api/status/:id/stream is mounted (not 404)', async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 500);

      try {
        const res = await fetch(
          `${baseUrl}/api/status/${FAKE_UUID}/stream`,
          { signal: controller.signal }
        );
        assert.notEqual(res.status, 404, '/api/status/:id/stream not mounted');
      } catch (err) {
        if (err.name !== 'AbortError') throw err;
      } finally {
        clearTimeout(timeout);
      }
    });
  });
});
