// backend/tests/logStreamErrors.unit.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapLogStreamError,
  LOG_STREAM_ERRORS,
} from '../src/utils/logStreamErrors.js';

// ---------------------------------------------------------------------------
// mapLogStreamError — all error branches
// ---------------------------------------------------------------------------

describe('mapLogStreamError — container not found', () => {
  it('maps "No such container" to CONTAINER_NOT_FOUND with 404', () => {
    const result = mapLogStreamError(new Error('No such container: abc123'));
    assert.equal(result.code, LOG_STREAM_ERRORS.CONTAINER_NOT_FOUND);
    assert.equal(result.statusCode, 404);
    assert.ok(result.message.toLowerCase().includes('container'));
  });

  it('returns a non-empty message string', () => {
    const result = mapLogStreamError(new Error('No such container: xyz'));
    assert.ok(typeof result.message === 'string');
    assert.ok(result.message.length > 0);
  });
});

describe('mapLogStreamError — Docker daemon unreachable', () => {
  it('maps "connect ENOENT" to DOCKER_DAEMON_UNREACHABLE with 503', () => {
    const result = mapLogStreamError(new Error('connect ENOENT /var/run/docker.sock'));
    assert.equal(result.code, LOG_STREAM_ERRORS.DOCKER_DAEMON_UNREACHABLE);
    assert.equal(result.statusCode, 503);
  });

  it('maps "connect ECONNREFUSED" to DOCKER_DAEMON_UNREACHABLE with 503', () => {
    const result = mapLogStreamError(new Error('connect ECONNREFUSED 127.0.0.1:2375'));
    assert.equal(result.code, LOG_STREAM_ERRORS.DOCKER_DAEMON_UNREACHABLE);
    assert.equal(result.statusCode, 503);
  });

  it('includes Docker running hint in message', () => {
    const result = mapLogStreamError(new Error('connect ENOENT /var/run/docker.sock'));
    assert.ok(result.message.toLowerCase().includes('docker'));
  });
});

describe('mapLogStreamError — stream connection dropped', () => {
  it('maps "write after end" to STREAM_CONNECTION_DROPPED with 499', () => {
    const result = mapLogStreamError(new Error('write after end'));
    assert.equal(result.code, LOG_STREAM_ERRORS.STREAM_CONNECTION_DROPPED);
    assert.equal(result.statusCode, 499);
  });

  it('maps "ERR_HTTP_HEADERS_SENT" to STREAM_CONNECTION_DROPPED with 499', () => {
    const result = mapLogStreamError(new Error('ERR_HTTP_HEADERS_SENT'));
    assert.equal(result.code, LOG_STREAM_ERRORS.STREAM_CONNECTION_DROPPED);
    assert.equal(result.statusCode, 499);
  });
});

describe('mapLogStreamError — build stream failed', () => {
  it('maps "build failed" to BUILD_STREAM_FAILED with 500', () => {
    const result = mapLogStreamError(new Error('build failed: exit code 1'));
    assert.equal(result.code, LOG_STREAM_ERRORS.BUILD_STREAM_FAILED);
    assert.equal(result.statusCode, 500);
  });

  it('maps "buildImage" error to BUILD_STREAM_FAILED with 500', () => {
    const result = mapLogStreamError(new Error('buildImage call failed'));
    assert.equal(result.code, LOG_STREAM_ERRORS.BUILD_STREAM_FAILED);
    assert.equal(result.statusCode, 500);
  });
});

describe('mapLogStreamError — polling failed', () => {
  it('maps "polling" error to POLLING_FAILED with 500', () => {
    const result = mapLogStreamError(new Error('polling error occurred'));
    assert.equal(result.code, LOG_STREAM_ERRORS.POLLING_FAILED);
    assert.equal(result.statusCode, 500);
  });

  it('maps "tail" error to POLLING_FAILED with 500', () => {
    const result = mapLogStreamError(new Error('tail fetch failed'));
    assert.equal(result.code, LOG_STREAM_ERRORS.POLLING_FAILED);
    assert.equal(result.statusCode, 500);
  });
});

describe('mapLogStreamError — generic fallback', () => {
  it('maps unknown error to SSE_WRITE_FAILED with 500', () => {
    const result = mapLogStreamError(new Error('something completely unexpected'));
    assert.equal(result.code, LOG_STREAM_ERRORS.SSE_WRITE_FAILED);
    assert.equal(result.statusCode, 500);
  });

  it('handles null error gracefully', () => {
    const result = mapLogStreamError(null);
    assert.equal(typeof result.code, 'string');
    assert.equal(typeof result.message, 'string');
    assert.equal(typeof result.statusCode, 'number');
  });

  it('handles undefined error gracefully', () => {
    const result = mapLogStreamError(undefined);
    assert.equal(typeof result.code, 'string');
    assert.equal(result.statusCode, 500);
  });

  it('handles error with no message property', () => {
    const result = mapLogStreamError({});
    assert.equal(typeof result.message, 'string');
    assert.ok(result.message.length > 0);
  });
});

describe('LOG_STREAM_ERRORS enum', () => {
  it('contains all expected error code keys', () => {
    const expected = [
      'CONTAINER_NOT_FOUND',
      'STREAM_CONNECTION_DROPPED',
      'BUILD_STREAM_FAILED',
      'DOCKER_DAEMON_UNREACHABLE',
      'INVALID_CONTAINER_ID',
      'POLLING_FAILED',
      'SSE_WRITE_FAILED',
    ];
    for (const key of expected) {
      assert.ok(
        key in LOG_STREAM_ERRORS,
        `Missing error code: ${key}`,
      );
    }
  });

  it('has exactly 7 error codes', () => {
    assert.equal(Object.keys(LOG_STREAM_ERRORS).length, 7);
  });
});
