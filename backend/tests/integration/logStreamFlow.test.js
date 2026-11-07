import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer } from './helpers/startServer.js';

let server;
let baseUrl;

describe('Integration — Log Stream Flow (SSE)', () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
  });

  after(async () => {
    await stopTestServer(server);
  });

  // ── Invalid / Missing ID guards ───────────────────────────
  describe('GET /api/logs/:containerId/stream — invalid input', () => {
    it('missing containerId segment returns 404', async () => {
      const res = await fetch(`${baseUrl}/api/logs/`);
      assert.equal(res.status, 404);
    });

    it('invalid containerId returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/logs/!!!invalid!!!/stream`);
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for invalid containerId, got ${res.status}`
      );
    });

    it('invalid containerId error response is JSON', async () => {
      const res = await fetch(`${baseUrl}/api/logs/!!!invalid!!!/stream`);
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(
        ct.includes('application/json'),
        `Expected JSON error, got: ${ct}`
      );
    });

    it('invalid containerId error body has error or message field', async () => {
      const res = await fetch(`${baseUrl}/api/logs/!!!invalid!!!/stream`);
      const body = await res.json();
      assert.ok(
        body.error || body.message,
        `Expected structured error, got: ${JSON.stringify(body)}`
      );
    });
  });

  // ── SSE Connection with valid UUID format ─────────────────
  describe('GET /api/logs/:containerId/stream — SSE headers', () => {
    it('valid UUID format opens SSE stream with correct headers', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000001';
      const controller = new AbortController();

      // abort after 500ms so connection does not hang
      const timeout = setTimeout(() => controller.abort(), 500);

      try {
        const res = await fetch(`${baseUrl}/api/logs/${fakeUuid}/stream`, {
          signal: controller.signal,
        });

        // SSE must respond with text/event-stream
        const ct = res.headers.get('content-type') ?? '';
        assert.ok(
          ct.includes('text/event-stream'),
          `Expected text/event-stream, got: ${ct}`
        );

        // Cache-Control must be no-cache for SSE
        const cc = res.headers.get('cache-control') ?? '';
        assert.ok(
          cc.includes('no-cache'),
          `Expected cache-control: no-cache, got: ${cc}`
        );
      } catch (err) {
        // AbortError is expected — connection was alive (good)
        if (err.name !== 'AbortError') throw err;
      } finally {
        clearTimeout(timeout);
      }
    });

    it('SSE connection sets Connection: keep-alive', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000002';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 500);

      try {
        const res = await fetch(`${baseUrl}/api/logs/${fakeUuid}/stream`, {
          signal: controller.signal,
        });
        const conn = res.headers.get('connection') ?? '';
        assert.ok(
          conn.toLowerCase().includes('keep-alive'),
          `Expected keep-alive, got: ${conn}`
        );
      } catch (err) {
        if (err.name !== 'AbortError') throw err;
      } finally {
        clearTimeout(timeout);
      }
    });

    it('SSE stream sends at least one data event before abort', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000003';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);

      let receivedData = false;

      try {
        const res = await fetch(`${baseUrl}/api/logs/${fakeUuid}/stream`, {
          signal: controller.signal,
        });

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

      assert.ok(receivedData, 'SSE stream should send at least one data: event');
    });
  });

  // ── Route Registration ─────────────────────────────────────
  describe('Route registration', () => {
    it('GET /api/logs/:containerId/stream is mounted (not 404)', async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 500);

      try {
        const res = await fetch(
          `${baseUrl}/api/logs/00000000-0000-0000-0000-000000000000/stream`,
          { signal: controller.signal }
        );
        assert.notEqual(res.status, 404, '/api/logs/:containerId/stream not mounted');
      } catch (err) {
        if (err.name !== 'AbortError') throw err;
        // AbortError = connection was alive = route IS mounted
      } finally {
        clearTimeout(timeout);
      }
    });
  });
});
