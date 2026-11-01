// backend/tests/sseHelper.test.js

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  setSseHeaders,
  sendSseEvent,
  sendLogLine,
  closeSseStream,
  onClientDisconnect,
} from '../src/utils/sseHelper.js';

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal mock Express response object.
 * Captures all headers set and all chunks written.
 */
function mockRes() {
  return {
    headers: {},
    written: [],
    ended: false,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    flushHeaders() {
      this.flushed = true;
    },
    write(chunk) {
      this.written.push(chunk);
    },
    end() {
      this.ended = true;
    },
  };
}

/**
 * Creates a minimal mock Express request object.
 * Stores registered event listeners so tests can trigger them manually.
 */
function mockReq() {
  return {
    listeners: {},
    on(event, cb) {
      this.listeners[event] = cb;
    },
    trigger(event) {
      if (this.listeners[event]) this.listeners[event]();
    },
  };
}

// ---------------------------------------------------------------------------
// setSseHeaders
// ---------------------------------------------------------------------------

describe('setSseHeaders', () => {
  it('sets Content-Type to text/event-stream', () => {
    const res = mockRes();
    setSseHeaders(res);
    assert.equal(res.headers['Content-Type'], 'text/event-stream');
  });

  it('sets Cache-Control to no-cache', () => {
    const res = mockRes();
    setSseHeaders(res);
    assert.equal(res.headers['Cache-Control'], 'no-cache');
  });

  it('sets Connection to keep-alive', () => {
    const res = mockRes();
    setSseHeaders(res);
    assert.equal(res.headers['Connection'], 'keep-alive');
  });

  it('sets X-Accel-Buffering to no', () => {
    const res = mockRes();
    setSseHeaders(res);
    assert.equal(res.headers['X-Accel-Buffering'], 'no');
  });

  it('calls flushHeaders', () => {
    const res = mockRes();
    setSseHeaders(res);
    assert.equal(res.flushed, true);
  });
});

// ---------------------------------------------------------------------------
// sendSseEvent
// ---------------------------------------------------------------------------

describe('sendSseEvent', () => {
  it('writes correctly formatted SSE event string', () => {
    const res = mockRes();
    sendSseEvent(res, 'log', { line: 'hello' });
    assert.equal(
      res.written[0],
      `event: log\ndata: ${JSON.stringify({ line: 'hello' })}\n\n`,
    );
  });

  it('handles event with nested object payload', () => {
    const res = mockRes();
    const payload = { status: 'done', message: 'finished', ts: 123 };
    sendSseEvent(res, 'status', payload);
    assert.ok(res.written[0].includes('"status":"done"'));
  });

  it('writes exactly one chunk per call', () => {
    const res = mockRes();
    sendSseEvent(res, 'ping', {});
    assert.equal(res.written.length, 1);
  });
});

// ---------------------------------------------------------------------------
// sendLogLine
// ---------------------------------------------------------------------------

describe('sendLogLine', () => {
  it('sends a log event with the correct line and default stdout stream', () => {
    const res = mockRes();
    sendLogLine(res, 'npm install complete');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.line, 'npm install complete');
    assert.equal(parsed.stream, 'stdout');
  });

  it('sends stderr stream when specified', () => {
    const res = mockRes();
    sendLogLine(res, 'error: module not found', 'stderr');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.stream, 'stderr');
  });

  it('includes a numeric timestamp in payload', () => {
    const res = mockRes();
    sendLogLine(res, 'build step 1');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(typeof parsed.ts, 'number');
  });
});

// ---------------------------------------------------------------------------
// closeSseStream
// ---------------------------------------------------------------------------

describe('closeSseStream', () => {
  it('sends a status event before ending the response', () => {
    const res = mockRes();
    closeSseStream(res, 'done', 'stream finished');
    assert.ok(res.written[0].includes('"status":"done"'));
    assert.ok(res.written[0].includes('"message":"stream finished"'));
  });

  it('calls res.end() after sending the status event', () => {
    const res = mockRes();
    closeSseStream(res);
    assert.equal(res.ended, true);
  });

  it('defaults to status done and empty message', () => {
    const res = mockRes();
    closeSseStream(res);
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.status, 'done');
    assert.equal(parsed.message, '');
  });

  it('sends error status correctly', () => {
    const res = mockRes();
    closeSseStream(res, 'error', 'container not found');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.status, 'error');
    assert.equal(parsed.message, 'container not found');
  });
});

// ---------------------------------------------------------------------------
// onClientDisconnect
// ---------------------------------------------------------------------------

describe('onClientDisconnect', () => {
  it('registers a close listener on the request', () => {
    const req = mockReq();
    onClientDisconnect(req, () => {});
    assert.ok(typeof req.listeners['close'] === 'function');
  });

  it('calls the cleanup callback when close event fires', () => {
    const req = mockReq();
    let cleanupCalled = false;
    onClientDisconnect(req, () => { cleanupCalled = true; });
    req.trigger('close');
    assert.equal(cleanupCalled, true);
  });

  it('does not call cleanup before close event fires', () => {
    const req = mockReq();
    let cleanupCalled = false;
    onClientDisconnect(req, () => { cleanupCalled = true; });
    assert.equal(cleanupCalled, false);
  });
});
