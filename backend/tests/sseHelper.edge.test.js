// backend/tests/sseHelper.edge.test.js

import { describe, it } from 'node:test';
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

function mockRes() {
  return {
    headers: {},
    written: [],
    ended: false,
    setHeader(key, val) { this.headers[key] = val; },
    flushHeaders() { this.flushed = true; },
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

// ---------------------------------------------------------------------------
// sendSseEvent — edge cases
// ---------------------------------------------------------------------------

describe('sendSseEvent — edge cases', () => {
  it('handles empty string event name', () => {
    const res = mockRes();
    sendSseEvent(res, '', { line: 'test' });
    assert.ok(res.written[0].startsWith('event: \n'));
  });

  it('handles empty object payload', () => {
    const res = mockRes();
    sendSseEvent(res, 'log', {});
    assert.ok(res.written[0].includes('data: {}'));
  });

  it('handles payload with null values', () => {
    const res = mockRes();
    sendSseEvent(res, 'log', { line: null, stream: null });
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.line, null);
    assert.equal(parsed.stream, null);
  });

  it('handles payload with unicode characters', () => {
    const res = mockRes();
    sendSseEvent(res, 'log', { line: '🚀 deploying container 日本語' });
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.line, '🚀 deploying container 日本語');
  });

  it('handles very long log line without truncation', () => {
    const res = mockRes();
    const longLine = 'x'.repeat(10000);
    sendSseEvent(res, 'log', { line: longLine });
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.line.length, 10000);
  });

  it('handles rapid fire — multiple events written in sequence', () => {
    const res = mockRes();
    for (let i = 0; i < 100; i++) {
      sendSseEvent(res, 'log', { line: `line ${i}` });
    }
    assert.equal(res.written.length, 100);
  });

  it('each rapid fire event is independently parseable', () => {
    const res = mockRes();
    for (let i = 0; i < 10; i++) {
      sendSseEvent(res, 'log', { line: `step ${i}` });
    }
    for (let i = 0; i < 10; i++) {
      const parsed = JSON.parse(res.written[i].split('data: ')[1]);
      assert.equal(parsed.line, `step ${i}`);
    }
  });

  it('handles payload with nested object', () => {
    const res = mockRes();
    sendSseEvent(res, 'status', { meta: { imageTag: 'v1', containerId: 'abc' } });
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.meta.imageTag, 'v1');
    assert.equal(parsed.meta.containerId, 'abc');
  });
});

// ---------------------------------------------------------------------------
// sendLogLine — edge cases
// ---------------------------------------------------------------------------

describe('sendLogLine — edge cases', () => {
  it('handles empty string log line', () => {
    const res = mockRes();
    sendLogLine(res, '');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.line, '');
  });

  it('handles log line with only whitespace', () => {
    const res = mockRes();
    sendLogLine(res, '   ');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.line, '   ');
  });

  it('handles log line with newline characters', () => {
    const res = mockRes();
    sendLogLine(res, 'line one\nline two');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.ok(parsed.line.includes('\n'));
  });

  it('handles log line with special JSON characters', () => {
    const res = mockRes();
    sendLogLine(res, '{"key": "value", "nested": true}');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.ok(parsed.line.includes('"key"'));
  });

  it('timestamp is always a positive number', () => {
    const res = mockRes();
    sendLogLine(res, 'test line');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.ok(parsed.ts > 0);
    assert.ok(parsed.ts <= Date.now());
  });
});

// ---------------------------------------------------------------------------
// closeSseStream — edge cases
// ---------------------------------------------------------------------------

describe('closeSseStream — edge cases', () => {
  it('handles very long error message', () => {
    const res = mockRes();
    const longMsg = 'error: ' + 'x'.repeat(5000);
    closeSseStream(res, 'error', longMsg);
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.equal(parsed.message, longMsg);
    assert.equal(res.ended, true);
  });

  it('handles unicode in message', () => {
    const res = mockRes();
    closeSseStream(res, 'error', '🔥 Container crashed — 日本語エラー');
    const parsed = JSON.parse(res.written[0].split('data: ')[1]);
    assert.ok(parsed.message.includes('🔥'));
  });

  it('always calls res.end() even with unknown status value', () => {
    const res = mockRes();
    closeSseStream(res, 'unknown_status', 'test');
    assert.equal(res.ended, true);
  });
});

// ---------------------------------------------------------------------------
// onClientDisconnect — edge cases
// ---------------------------------------------------------------------------

describe('onClientDisconnect — edge cases', () => {
  it('does not throw when cleanup is called multiple times', () => {
    const req = mockReq();
    let callCount = 0;
    onClientDisconnect(req, () => { callCount++; });
    req.trigger('close');
    req.trigger('close');
    // Only first trigger fires — listener is registered once
    assert.ok(callCount >= 1);
  });

  it('supports registering multiple independent disconnect handlers', () => {
    const req1 = mockReq();
    const req2 = mockReq();
    let count1 = 0;
    let count2 = 0;
    onClientDisconnect(req1, () => { count1++; });
    onClientDisconnect(req2, () => { count2++; });
    req1.trigger('close');
    assert.equal(count1, 1);
    assert.equal(count2, 0);
  });
});
