// backend/tests/logStreamService.unit.test.js

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal mock Express response object.
 */
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
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

/**
 * Creates a minimal mock Express request object.
 */
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
 * Creates a mock Dockerode stream with controllable events.
 * Exposes emit() so tests can fire data/end/error manually.
 */
function mockDockerStream() {
  const listeners = {};
  return {
    listeners,
    on(event, cb) { listeners[event] = cb; },
    emit(event, data) { if (listeners[event]) listeners[event](data); },
    destroy: mock.fn(),
  };
}

/**
 * Creates a mock Dockerode container object.
 * Returns controllable log stream and modem.demuxStream behavior.
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
        // Store stdout/stderr writers so tests can invoke them
        src._stdout = stdout;
        src._stderr = stderr;
      }),
    },
  };
}

/**
 * Creates a mock Docker client that returns the given container mock.
 */
function mockDockerClient(container) {
  return {
    getContainer: mock.fn(() => container),
    buildImage: mock.fn(),
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

    // Dynamically import and override getDockerClient with mock
    const { streamDockerLogs } = await import('../src/services/logStreamService.js');
    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res);
    stream.emit('end');
    await pending;

    assert.equal(res.headers['Content-Type'], 'text/event-stream');
    assert.equal(res.headersSent, true);
  });

  it('calls container.logs with follow:true stdout:true stderr:true', async () => {
    const stream = mockDockerStream();
    const container = mockContainer(stream);
    const docker = mockDockerClient(container);

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { streamDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res);
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

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { streamDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res);
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

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { streamDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res);
    stream.emit('error', new Error('stream broke'));
    await pending;

    assert.equal(res.ended, true);
    const lastChunk = res.written[res.written.length - 1];
    assert.ok(lastChunk.includes('"status":"error"'));
  });

  it('closes SSE stream with error when container.logs throws', async () => {
    const container = mockContainer(null, true); // shouldThrow = true
    const docker = mockDockerClient(container);

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { streamDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    await streamDockerLogs('bad-id', req, res);

    assert.equal(res.ended, true);
    const lastChunk = res.written[res.written.length - 1];
    assert.ok(lastChunk.includes('"status":"error"'));
  });

  it('destroys log stream when client disconnects', async () => {
    const stream = mockDockerStream();
    const container = mockContainer(stream);
    const docker = mockDockerClient(container);

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { streamDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    const pending = streamDockerLogs('abc123', req, res);

    // Simulate client disconnect
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

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { pollDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    // Disconnect immediately after first poll to stop the interval
    setTimeout(() => req.trigger('close'), 10);
    await pollDockerLogs('abc123', req, res, 50, 5000);

    assert.equal(res.headers['Content-Type'], 'text/event-stream');
    assert.equal(res.headersSent, true);
  });

  it('sends log lines from first poll result', async () => {
    const container = {
      logs: mock.fn(async () => Buffer.from('step 1\nstep 2\n')),
    };
    const docker = mockDockerClient(container);

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { pollDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    setTimeout(() => req.trigger('close'), 10);
    await pollDockerLogs('abc123', req, res, 50, 5000);

    const allWritten = res.written.join('');
    assert.ok(allWritten.includes('step 1'));
    assert.ok(allWritten.includes('step 2'));
  });

  it('closes SSE stream with error when container.logs throws during poll', async () => {
    const container = {
      logs: mock.fn(async () => { throw new Error('polling error'); }),
    };
    const docker = mockDockerClient(container);

    mock.module('../src/config/docker.js', {
      namedExports: { getDockerClient: () => docker },
    });

    const { pollDockerLogs } = await import('../src/services/logStreamService.js');
    const req = mockReq();
    const res = mockRes();

    await pollDockerLogs('abc123', req, res, 50, 5000);

    assert.equal(res.ended, true);
    const lastChunk = res.written[res.written.length - 1];
    assert.ok(lastChunk.includes('"status":"error"'));
  });
});
