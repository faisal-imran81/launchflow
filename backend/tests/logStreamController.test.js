// backend/tests/logStreamController.test.js

import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleStreamContainerLogs, handleStreamBuildLogs } from '../src/controllers/logStreamController.js';

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal mock Express response object.
 * Tracks status code, json payload, written chunks, and ended state.
 */
function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    written: [],
    ended: false,
    headers: {},
    headersSent: false,
    setHeader(key, val) { this.headers[key] = val; },
    flushHeaders() { this.headersSent = true; },
    write(chunk) { this.written.push(chunk); },
    end() { this.ended = true; },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

/**
 * Creates a minimal mock Express request object.
 * Accepts params and query overrides for each test case.
 */
function mockReq(params = {}, query = {}) {
  return {
    params,
    query,
    listeners: {},
    on(event, cb) { this.listeners[event] = cb; },
  };
}

// ---------------------------------------------------------------------------
// handleStreamContainerLogs — input validation
// ---------------------------------------------------------------------------

describe('handleStreamContainerLogs — input validation', () => {
  it('returns 400 when containerId is missing', async () => {
    const req = mockReq({ containerId: '' });
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when containerId contains invalid characters', async () => {
    const req = mockReq({ containerId: '../../etc/passwd' });
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when containerId contains spaces', async () => {
    const req = mockReq({ containerId: 'my container' });
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when containerId is undefined', async () => {
    const req = mockReq({});
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('accepts a valid alphanumeric containerId', async () => {
    // Valid ID should pass validation and attempt to stream
    // We expect it NOT to return 400 (it may fail later at Dockerode level)
    const req = mockReq({ containerId: 'abc123def456' }, {});
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.notEqual(res.statusCode, 400);
  });

  it('accepts a containerId with dots and dashes', async () => {
    const req = mockReq({ containerId: 'my-container.v1' }, {});
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.notEqual(res.statusCode, 400);
  });
});

// ---------------------------------------------------------------------------
// handleStreamBuildLogs — input validation
// ---------------------------------------------------------------------------

describe('handleStreamBuildLogs — input validation', () => {
  it('returns 400 when imageTag is missing', async () => {
    const req = mockReq({ imageTag: '' });
    const res = mockRes();
    await handleStreamBuildLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when imageTag contains invalid characters', async () => {
    const req = mockReq({ imageTag: 'my image$$' });
    const res = mockRes();
    await handleStreamBuildLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when imageTag is undefined', async () => {
    const req = mockReq({});
    const res = mockRes();
    await handleStreamBuildLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when tarStream is missing on valid imageTag', async () => {
    const req = mockReq({ imageTag: 'myapp:latest' });
    const res = mockRes();
    // No req.tarStream attached — should return 400
    await handleStreamBuildLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('tar stream'));
  });

  it('accepts a valid imageTag with colon separator', async () => {
    const req = mockReq({ imageTag: 'myapp:v1.0' });
    req.tarStream = {}; // Attach mock tarStream to pass validation
    const res = mockRes();
    await handleStreamBuildLogs(req, res);
    assert.notEqual(res.statusCode, 400);
  });

  it('accepts a valid imageTag with registry prefix', async () => {
    const req = mockReq({ imageTag: 'registry.io/myapp:latest' });
    req.tarStream = {};
    const res = mockRes();
    await handleStreamBuildLogs(req, res);
    assert.notEqual(res.statusCode, 400);
  });
});
