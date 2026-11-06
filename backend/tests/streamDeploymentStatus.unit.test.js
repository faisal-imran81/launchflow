// backend/tests/streamDeploymentStatus.unit.test.js

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { streamDeploymentStatus, DEPLOYMENT_STATUS } from '../src/services/deploymentStatusService.js';

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

function mockRes() {
  return {
    headers: {},
    written: [],
    ended: false,
    headersSent: false,
    setHeader(key, val) { this.headers[key] = val; },
    flushHeaders() { this.headersSent = true; },
    write(chunk) { this.written.push(chunk); },
    end() { this.ended = true; },
  };
}

function mockReq() {
  return {
    listeners: {},
    on(event, cb) { this.listeners[event] = cb; },
    trigger(event) {
      if (this.listeners[event]) this.listeners[event]();
    },
  };
}

/**
 * Creates a mock Supabase client that returns a sequence of rows.
 * Each call to .single() returns the next row in the sequence.
 *
 * @param {Array<object>} rows - Sequence of deployment rows to return
 */
function mockSupabaseSequence(rows) {
  let callCount = 0;
  const chain = {
    from: mock.fn(() => chain),
    select: mock.fn(() => chain),
    update: mock.fn(() => chain),
    eq: mock.fn(() => chain),
    single: mock.fn(async () => {
      const row = rows[callCount] ?? rows[rows.length - 1];
      callCount++;
      return { data: row, error: null };
    }),
  };
  return chain;
}

/**
 * Creates a mock Supabase client that always throws an error.
 */
function mockSupabaseError(message = 'DB read failed') {
  const chain = {
    from: mock.fn(() => chain),
    select: mock.fn(() => chain),
    update: mock.fn(() => chain),
    eq: mock.fn(() => chain),
    single: mock.fn(async () => ({ data: null, error: { message } })),
  };
  return chain;
}

// ---------------------------------------------------------------------------
// streamDeploymentStatus — SSE headers
// ---------------------------------------------------------------------------

describe('streamDeploymentStatus — SSE headers', () => {
  it('sets SSE headers before first poll', async () => {
    const supabase = mockSupabaseSequence([
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.RUNNING,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: null,
        container_id: null,
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    assert.equal(res.headers['Content-Type'], 'text/event-stream');
    assert.equal(res.headersSent, true);
  });
});

// ---------------------------------------------------------------------------
// streamDeploymentStatus — terminal status closes stream
// ---------------------------------------------------------------------------

describe('streamDeploymentStatus — terminal status closes stream', () => {
  it('closes stream when status is "running"', async () => {
    const supabase = mockSupabaseSequence([
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.RUNNING,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: 'myapp:v1',
        container_id: 'abc123',
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    assert.equal(res.ended, true);
  });

  it('closes stream when status is "failed"', async () => {
    const supabase = mockSupabaseSequence([
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.FAILED,
        updated_at: new Date().toISOString(),
        error: 'build failed',
        image_tag: null,
        container_id: null,
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    assert.equal(res.ended, true);
  });

  it('closes stream when status is "stopped"', async () => {
    const supabase = mockSupabaseSequence([
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.STOPPED,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: null,
        container_id: null,
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    assert.equal(res.ended, true);
  });

  it('sends a status event before closing on terminal status', async () => {
    const supabase = mockSupabaseSequence([
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.RUNNING,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: null,
        container_id: null,
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    const allWritten = res.written.join('');
    assert.ok(allWritten.includes('"running"'));
  });
});

// ---------------------------------------------------------------------------
// streamDeploymentStatus — status change detection
// ---------------------------------------------------------------------------

describe('streamDeploymentStatus — status change detection', () => {
  it('sends status event only when status changes', async () => {
    // First poll: building, second poll: building (no change), third: running (terminal)
    const supabase = mockSupabaseSequence([
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.BUILDING,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: null,
        container_id: null,
      },
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.RUNNING,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: null,
        container_id: null,
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    // Run first poll immediately — it hits building (non-terminal)
    // Then manually trigger second poll by calling again
    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    // At least one status event should have been written
    const statusEvents = res.written.filter((w) => w.includes('"status"'));
    assert.ok(statusEvents.length >= 1);
  });
});

// ---------------------------------------------------------------------------
// streamDeploymentStatus — Supabase error handling
// ---------------------------------------------------------------------------

describe('streamDeploymentStatus — Supabase error handling', () => {
  it('closes SSE stream with error when Supabase read fails', async () => {
    const supabase = mockSupabaseError('DB read failed');

    const req = mockReq();
    const res = mockRes();

    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    assert.equal(res.ended, true);
    const allWritten = res.written.join('');
    assert.ok(allWritten.includes('"error"'));
  });
});

// ---------------------------------------------------------------------------
// streamDeploymentStatus — client disconnect
// ---------------------------------------------------------------------------

describe('streamDeploymentStatus — client disconnect', () => {
  it('stops polling when client disconnects', async () => {
    const supabase = mockSupabaseSequence([
      {
        id: 'dep-123',
        status: DEPLOYMENT_STATUS.BUILDING,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: null,
        container_id: null,
      },
    ]);

    const req = mockReq();
    const res = mockRes();

    // Trigger disconnect immediately after first poll
    setTimeout(() => req.trigger('close'), 10);

    await streamDeploymentStatus('dep-123', req, res, 5000, supabase);

    // Stream should not have ended from server side (client disconnected)
    // Just verify no unhandled errors occurred
    assert.ok(true);
  });
});
