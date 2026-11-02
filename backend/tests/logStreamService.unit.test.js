// backend/tests/logStreamService.unit.test.js

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  streamDockerLogs,
  pollDockerLogs,
} from '../src/services/logStreamService.js';

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
 * Creates a controllable mock Docker stream.
 * Call stream.emit('end') or stream.emit('error', err) in tests.
 */
function mockDockerStream() {
  const listeners = {};
  return {
    on(event, cb) { listeners[event] = cb; return this; },
    emit(event, data) { if (listeners[event]) listeners[event](data); },
    destroy: mock.fn(),
  };
}

/**
 * Creates a mock Docker container with controllable logs() behavior.
 *
 * @param {object|null} logStreamOverride - Mock stream to return from logs()
 * @param {boolean}     shouldThrow       - If true, logs() throws instead
 */
function mockContainer(logStreamOverride = null, shouldThrow = false) {
  const stream = logStreamOverride || mockDockerStream();
  return {
    stream,
    logs: mock.fn(async () => {
      if (shouldThrow) throw new Error('No such container');
      return stream;
    }),
    modem: {
      demuxStream: mock.fn((src, stdout, stderr) => {
        // Store writers so tests can invoke them directly if needed
        src._stdout = stdout;
        src._stderr = stderr;
      }),
    },
  };
}

/**
 * Creates a mock Docker client that returns the given container.
 */
function mockDockerClient(container) {
  return {
    getContainer: mock.fn(() => container),
  };
}

// ---------------------------------------------------------------------------
// streamDockerLogs
// ---------------------------------------------------------------------------

describe('streamDockerLogs', () => {
  it('sets SSE headers before streaming', async () => {
    const stream = mockDockerStream();
    const container = mockContainer(stream);
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res, docker);
    stream.emit('end');
    await pending;

    assert.equal(res.headers['Content-Type'], 'text/event-stream');
    assert.equal(res.headersSent, true);
  });

  it('calls container.logs with follow:true stdout:true stderr:true', async () => {
    const stream = mockDockerStream();
    const container = mockContainer(stream);
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res, docker);
    stream.emit('end');
    await pending;

    const callArgs = container.logs.mock.calls[0].arguments[0];
    assert.equal(callArgs.follow, true);
    assert.equal(callArgs.stdout, true);
    assert.equal(callArgs.stderr, true);
  });

  it('closes SSE stream with done status when log stream ends', async () => {
    const stream = mockDockerStream();
    const container = mockContainer(stream);
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res, docker);
    // Wait one microtask tick so container.logs() resolves and
    // on('end') listener is registered before we emit
    await Promise.resolve();
    stream.emit('end');
    await pending;

    assert.equal(res.ended, true);
    const lastChunk = res.written[res.written.length - 1];
    assert.ok(lastChunk.includes('"status":"done"'));
  });

  it('closes SSE stream with error status on stream error', async () => {
    const stream = mockDockerStream();
    const container = mockContainer(stream);
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res, docker);
    // Wait one microtask tick so container.logs() resolves and
    // on('error') listener is registered before we emit
    await Promise.resolve();
    stream.emit('error', new Error('stream broke'));
    await pending;

    assert.equal(res.ended, true);
    const lastChunk = res.written[res.written.length - 1];
    assert.ok(lastChunk.includes('"status":"error"'));
  });

  it('closes SSE stream with error when container.logs throws', async () => {
    const container = mockContainer(null, true);
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    await streamDockerLogs('bad-id', req, res, docker);

    assert.equal(res.ended, true);
    const lastChunk = res.written[res.written.length - 1];
    assert.ok(lastChunk.includes('"status":"error"'));
  });

  it('destroys log stream when client disconnects', async () => {
    const stream = mockDockerStream();
    const container = mockContainer(stream);
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res, docker);
    // Wait one microtask tick so container.logs() resolves and
    // the logStream reference is captured before triggering close
    await Promise.resolve();
    req.trigger('close');
    stream.emit('end');
    await pending;

    assert.equal(stream.destroy.mock.calls.length, 1);
  });
});

// ---------------------------------------------------------------------------
// pollDockerLogs
// ---------------------------------------------------------------------------

describe('pollDockerLogs', () => {
  it('sets SSE headers before first poll', async () => {
    const container = {
      logs: mock.fn(async () => Buffer.from('log line one\n')),
    };
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    // Trigger disconnect immediately after first poll to stop the interval
    setTimeout(() => req.trigger('close'), 10);
    await pollDockerLogs('abc123', req, res, 50, 5000, docker);

    assert.equal(res.headers['Content-Type'], 'text/event-stream');
    assert.equal(res.headersSent, true);
  });

  it('sends log lines from first poll result', async () => {
    const container = {
      logs: mock.fn(async () => Buffer.from('step 1\nstep 2\n')),
    };
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    setTimeout(() => req.trigger('close'), 10);
    await pollDockerLogs('abc123', req, res, 50, 5000, docker);

    const allWritten = res.written.join('');
    assert.ok(allWritten.includes('step 1'));
    assert.ok(allWritten.includes('step 2'));
  });

  it('closes SSE stream with error when container.logs throws during poll', async () => {
    const container = {
      logs: mock.fn(async () => { throw new Error('polling error'); }),
    };
    const docker = mockDockerClient(container);

    const req = mockReq();
    const res = mockRes();

    await pollDockerLogs('abc123', req, res, 50, 5000, docker);

    assert.equal(res.ended, true);
    const lastChunk = res.written[res.written.length - 1];
    assert.ok(lastChunk.includes('"status":"error"'));
  });
});
