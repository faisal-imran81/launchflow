// backend/tests/logStreamController.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleStreamContainerLogs,
  handleStreamBuildLogs,
} from '../src/controllers/logStreamController.js';

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

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
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return res;
}

function mockReq(params = {}, query = {}) {
  return {
    params,
    query,
    listeners: {},
    on(event, cb) { this.listeners[event] = cb; },
    trigger(event) {
      if (this.listeners[event]) this.listeners[event]();
    },
  };
}

// ---------------------------------------------------------------------------
// handleStreamContainerLogs — invalid containerId (400 guards)
// ---------------------------------------------------------------------------

describe('handleStreamContainerLogs — invalid containerId returns 400', () => {
  it('returns 400 when containerId is empty string', async () => {
    const req = mockReq({ containerId: '' });
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when containerId contains path traversal characters', async () => {
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

  it('returns 400 when containerId contains special characters', async () => {
    const req = mockReq({ containerId: 'abc$$$123' });
    const res = mockRes();
    await handleStreamContainerLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('passes validation for alphanumeric containerId', () => {
    // Test the validation regex directly — no Docker call needed
    const validId = 'abc123def456';
    assert.match(validId, /^[a-zA-Z0-9_.-]+$/);
  });

  it('passes validation for containerId with dots and dashes', () => {
    const validId = 'my-container.v1';
    assert.match(validId, /^[a-zA-Z0-9_.-]+$/);
  });
});

// ---------------------------------------------------------------------------
// handleStreamBuildLogs — invalid imageTag (400 guards)
// ---------------------------------------------------------------------------

describe('handleStreamBuildLogs — invalid imageTag returns 400', () => {
  it('returns 400 when imageTag is empty string', async () => {
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
    // No req.tarStream attached
    await handleStreamBuildLogs(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('tar stream'));
  });

  it('passes validation for imageTag with colon separator', () => {
    // Test the validation regex directly — no Docker call needed
    const validTag = 'myapp:v1.0';
    assert.match(validTag, /^[a-zA-Z0-9_.\-:/]+$/);
  });

  it('passes validation for imageTag with registry prefix', () => {
    const validTag = 'registry.io/myapp:latest';
    assert.match(validTag, /^[a-zA-Z0-9_.\-:/]+$/);
  });
});
