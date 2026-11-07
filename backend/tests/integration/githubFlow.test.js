import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer } from './helpers/startServer.js';

let server;
let baseUrl;

describe('Integration — GitHub Flow', () => {
  before(async () => {
    ({ server, baseUrl } = await startTestServer());
  });

  after(async () => {
    await stopTestServer(server);
  });

  describe('GET /api/github/repos/:username — input validation', () => {
    it('missing username returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/github/repos`);
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for missing params, got ${res.status}`
      );
    });

    it('missing username error response is structured JSON', async () => {
      const res = await fetch(`${baseUrl}/api/github/repos`);
      const body = await res.json();
      assert.ok(body.error || body.message, `Expected error body, got: ${JSON.stringify(body)}`);
    });

    it('invalid username returns structured error not a crash', async () => {
      const res = await fetch(`${baseUrl}/api/github/repos/__xyz_does_not_exist_12345__`);
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON, got: ${ct}`);
      const body = await res.json();
      assert.ok(body.error || body.message || Array.isArray(body));
    });
  });

  describe('GET /api/github/repo/:owner/:repo — input validation', () => {
    it('missing owner returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/github/repo`);
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for missing owner, got ${res.status}`
      );
    });

    it('missing repo returns 4xx not 500', async () => {
      const res = await fetch(`${baseUrl}/api/github/repo/testowner`);
      assert.ok(
        res.status >= 400 && res.status < 500,
        `Expected 4xx for missing repo, got ${res.status}`
      );
    });

    it('missing params error response is structured JSON', async () => {
      const res = await fetch(`${baseUrl}/api/github/repo`);
      const body = await res.json();
      assert.ok(body.error || body.message, `Expected error body, got: ${JSON.stringify(body)}`);
    });
  });

  describe('GET /api/github/rate-limit', () => {
    it('rate-limit endpoint is registered (not 404)', async () => {
      const res = await fetch(`${baseUrl}/api/github/rate-limit`);
      assert.notEqual(res.status, 404, '/api/github/rate-limit not registered');
    });

    it('rate-limit response is JSON', async () => {
      const res = await fetch(`${baseUrl}/api/github/rate-limit`);
      const ct = res.headers.get('content-type') ?? '';
      assert.ok(ct.includes('application/json'), `Expected JSON content-type, got: ${ct}`);
    });
  });
});
