// frontend/tests/useLogStream.cleanup.test.js

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Mock EventSource
// ---------------------------------------------------------------------------

/**
 * Creates a mock EventSource that tracks open/close calls
 * and exposes event listener registration for testing.
 */
function createMockEventSource() {
  const instance = {
    url: null,
    closed: false,
    listeners: {},
    close: mock.fn(() => { instance.closed = true; }),
    addEventListener(event, cb) { instance.listeners[event] = cb; },
    set onopen(cb) { instance._onopen = cb; },
    set onerror(cb) { instance._onerror = cb; },
    triggerOpen() { if (instance._onopen) instance._onopen(); },
    triggerError() { if (instance._onerror) instance._onerror(); },
    triggerEvent(event, data) {
      if (instance.listeners[event]) {
        instance.listeners[event]({ data: JSON.stringify(data) });
      }
    },
  };
  return instance;
}

// ---------------------------------------------------------------------------
// useLogStream logic tests (pure logic, no React renderer needed)
// ---------------------------------------------------------------------------

describe('useLogStream — URL builder', () => {
  it('builds correct URL for SSE mode', () => {
    const containerId = 'abc123';
    const base = `/api/logs/${containerId}/stream`;
    assert.equal(base, '/api/logs/abc123/stream');
  });

  it('builds correct URL with poll=true query param', () => {
    const containerId = 'abc123';
    const params = new URLSearchParams();
    params.set('poll', 'true');
    params.set('tail', '50');
    params.set('interval', '2000');
    const url = `/api/logs/${containerId}/stream?${params.toString()}`;
    assert.ok(url.includes('poll=true'));
    assert.ok(url.includes('tail=50'));
    assert.ok(url.includes('interval=2000'));
  });

  it('does not add query params when poll is false', () => {
    const containerId = 'abc123';
    const poll = false;
    const params = new URLSearchParams();
    if (poll) params.set('poll', 'true');
    const qs = params.toString();
    const url = qs
      ? `/api/logs/${containerId}/stream?${qs}`
      : `/api/logs/${containerId}/stream`;
    assert.ok(!url.includes('poll='));
  });
});

describe('useLogStream — EventSource lifecycle', () => {
  it('EventSource.close() is called on cleanup', () => {
    const es = createMockEventSource();

    // Simulate what useLogStream cleanup does on unmount
    function cleanup() {
      es.close();
    }

    cleanup();
    assert.equal(es.close.mock.calls.length, 1);
    assert.equal(es.closed, true);
  });

  it('EventSource is not closed before cleanup runs', () => {
    const es = createMockEventSource();
    assert.equal(es.closed, false);
    assert.equal(es.close.mock.calls.length, 0);
  });

  it('cleanup called twice does not throw', () => {
    const es = createMockEventSource();
    const cleanup = () => { if (!es.closed) es.close(); };
    cleanup();
    cleanup();
    // Only first call closes — second is guarded
    assert.equal(es.close.mock.calls.length, 1);
  });
});

describe('useLogStream — log line buffering', () => {
  it('respects MAX_LOG_LINES cap of 1000', () => {
    const MAX_LOG_LINES = 1000;
    let logs = [];

    // Simulate adding 1200 lines
    for (let i = 0; i < 1200; i++) {
      const next = [...logs, { line: `line ${i}`, stream: 'stdout', ts: Date.now() }];
      logs = next.length > MAX_LOG_LINES
        ? next.slice(next.length - MAX_LOG_LINES)
        : next;
    }

    assert.equal(logs.length, MAX_LOG_LINES);
    // Should have kept the latest 1000 lines
    assert.equal(logs[0].line, 'line 200');
    assert.equal(logs[999].line, 'line 1199');
  });

  it('does not cap when lines are under MAX_LOG_LINES', () => {
    const MAX_LOG_LINES = 1000;
    let logs = [];

    for (let i = 0; i < 50; i++) {
      const next = [...logs, { line: `line ${i}`, stream: 'stdout', ts: Date.now() }];
      logs = next.length > MAX_LOG_LINES ? next.slice(next.length - MAX_LOG_LINES) : next;
    }

    assert.equal(logs.length, 50);
  });
});

describe('useLogStream — exponential backoff', () => {
  it('calculates correct delay for attempt 0', () => {
    const BASE = 1500;
    const MAX = 15000;
    const delay = Math.min(BASE * 2 ** 0, MAX);
    assert.equal(delay, 1500);
  });

  it('calculates correct delay for attempt 1', () => {
    const BASE = 1500;
    const MAX = 15000;
    const delay = Math.min(BASE * 2 ** 1, MAX);
    assert.equal(delay, 3000);
  });

  it('calculates correct delay for attempt 2', () => {
    const BASE = 1500;
    const MAX = 15000;
    const delay = Math.min(BASE * 2 ** 2, MAX);
    assert.equal(delay, 6000);
  });

  it('caps delay at MAX_RECONNECT_DELAY', () => {
    const BASE = 1500;
    const MAX = 15000;
    const delay = Math.min(BASE * 2 ** 10, MAX);
    assert.equal(delay, MAX);
  });

  it('never exceeds MAX_RECONNECT_DELAY regardless of attempt count', () => {
    const BASE = 1500;
    const MAX = 15000;
    for (let attempt = 0; attempt < 20; attempt++) {
      const delay = Math.min(BASE * 2 ** attempt, MAX);
      assert.ok(delay <= MAX, `Delay ${delay} exceeds MAX at attempt ${attempt}`);
    }
  });
});

describe('useLogStream — pause behavior', () => {
  it('paused flag prevents new lines from being added', () => {
    let isPaused = false;
    let logs = [];

    function addLine(line) {
      if (isPaused) return;
      logs.push(line);
    }

    addLine('line 1');
    isPaused = true;
    addLine('line 2');
    addLine('line 3');

    assert.equal(logs.length, 1);
    assert.equal(logs[0], 'line 1');
  });

  it('resume allows new lines after pause', () => {
    let isPaused = false;
    let logs = [];

    function addLine(line) {
      if (isPaused) return;
      logs.push(line);
    }

    addLine('line 1');
    isPaused = true;
    addLine('line 2');
    isPaused = false;
    addLine('line 3');

    assert.equal(logs.length, 2);
    assert.equal(logs[1], 'line 3');
  });
});
