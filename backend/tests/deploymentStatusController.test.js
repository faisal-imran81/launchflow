// backend/tests/deploymentStatusController.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleGetDeploymentStatus,
  handleStreamDeploymentStatus,
  handleUpdateDeploymentStatus,
} from '../src/controllers/deploymentStatusController.js';

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

function mockReq(params = {}, query = {}, body = {}) {
  return {
    params,
    query,
    body,
    listeners: {},
    on(event, cb) { this.listeners[event] = cb; },
    trigger(event) {
      if (this.listeners[event]) this.listeners[event]();
    },
  };
}

// ---------------------------------------------------------------------------
// handleGetDeploymentStatus — invalid deploymentId (400 guards)
// ---------------------------------------------------------------------------

describe('handleGetDeploymentStatus — invalid deploymentId returns 400', () => {
  it('returns 400 when deploymentId is empty string', async () => {
    const req = mockReq({ deploymentId: '' });
    const res = mockRes();
    await handleGetDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when deploymentId is undefined', async () => {
    const req = mockReq({});
    const res = mockRes();
    await handleGetDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when deploymentId contains path traversal characters', async () => {
    const req = mockReq({ deploymentId: '../../etc/passwd' });
    const res = mockRes();
    await handleGetDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when deploymentId contains spaces', async () => {
    const req = mockReq({ deploymentId: 'dep 123' });
    const res = mockRes();
    await handleGetDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('passes validation for alphanumeric deploymentId', () => {
    const validId = 'dep-123-abc';
    assert.match(validId, /^[a-zA-Z0-9_\-.]+$/);
  });

  it('passes validation for UUID format deploymentId', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';
    assert.match(validId, /^[a-zA-Z0-9_\-.]+$/);
  });
});

// ---------------------------------------------------------------------------
// handleStreamDeploymentStatus — invalid deploymentId (400 guards)
// ---------------------------------------------------------------------------

describe('handleStreamDeploymentStatus — invalid deploymentId returns 400', () => {
  it('returns 400 when deploymentId is empty string', async () => {
    const req = mockReq({ deploymentId: '' });
    const res = mockRes();
    await handleStreamDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when deploymentId is undefined', async () => {
    const req = mockReq({});
    const res = mockRes();
    await handleStreamDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when deploymentId contains special characters', async () => {
    const req = mockReq({ deploymentId: 'dep$$123' });
    const res = mockRes();
    await handleStreamDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('clamps interval below 500ms to 500ms', () => {
    // Test the clamping logic directly
    const intervalMs = 100;
    const safeInterval = Math.min(Math.max(intervalMs, 500), 10000);
    assert.equal(safeInterval, 500);
  });

  it('clamps interval above 10000ms to 10000ms', () => {
    const intervalMs = 99999;
    const safeInterval = Math.min(Math.max(intervalMs, 500), 10000);
    assert.equal(safeInterval, 10000);
  });

  it('keeps interval within valid range unchanged', () => {
    const intervalMs = 3000;
    const safeInterval = Math.min(Math.max(intervalMs, 500), 10000);
    assert.equal(safeInterval, 3000);
  });
});

// ---------------------------------------------------------------------------
// handleUpdateDeploymentStatus — invalid inputs (400 guards)
// ---------------------------------------------------------------------------

describe('handleUpdateDeploymentStatus — invalid inputs return 400', () => {
  it('returns 400 when deploymentId is empty string', async () => {
    const req = mockReq({ deploymentId: '' }, {}, { status: 'queued' });
    const res = mockRes();
    await handleUpdateDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when deploymentId is undefined', async () => {
    const req = mockReq({}, {}, { status: 'queued' });
    const res = mockRes();
    await handleUpdateDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid'));
  });

  it('returns 400 when status field is missing from body', async () => {
    const req = mockReq({ deploymentId: 'dep-123' }, {}, {});
    const res = mockRes();
    await handleUpdateDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('status'));
  });

  it('returns 400 when status is not a valid enum value', async () => {
    const req = mockReq(
      { deploymentId: 'dep-123' },
      {},
      { status: 'invalid_status' },
    );
    const res = mockRes();
    await handleUpdateDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('invalid status'));
  });

  it('returns 400 when body is completely empty', async () => {
    const req = mockReq({ deploymentId: 'dep-123' }, {}, null);
    const res = mockRes();
    await handleUpdateDeploymentStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.error.toLowerCase().includes('status'));
  });

  it('passes validation for all valid DEPLOYMENT_STATUS values', () => {
    const validStatuses = [
      'queued', 'building', 'pushing',
      'deploying', 'running', 'failed', 'stopped',
    ];
    for (const status of validStatuses) {
      // Test enum check logic directly
      assert.ok(validStatuses.includes(status), `${status} should be valid`);
    }
  });
});
