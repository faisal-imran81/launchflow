// backend/tests/deploymentStatusErrors.unit.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapDeploymentStatusError,
  DEPLOYMENT_STATUS_ERRORS,
} from '../src/utils/deploymentStatusErrors.js';

// ---------------------------------------------------------------------------
// mapDeploymentStatusError — all error branches
// ---------------------------------------------------------------------------

describe('mapDeploymentStatusError — deployment not found', () => {
  it('maps "not found" to DEPLOYMENT_NOT_FOUND with 404', () => {
    const result = mapDeploymentStatusError(new Error('Deployment not found: dep-123'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.DEPLOYMENT_NOT_FOUND);
    assert.equal(result.statusCode, 404);
  });

  it('maps "No rows" to DEPLOYMENT_NOT_FOUND with 404', () => {
    const result = mapDeploymentStatusError(new Error('No rows returned from Supabase'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.DEPLOYMENT_NOT_FOUND);
    assert.equal(result.statusCode, 404);
  });

  it('returns a non-empty message string', () => {
    const result = mapDeploymentStatusError(new Error('not found'));
    assert.ok(typeof result.message === 'string');
    assert.ok(result.message.length > 0);
  });
});

describe('mapDeploymentStatusError — invalid status value', () => {
  it('maps "Invalid status value" to INVALID_STATUS_VALUE with 400', () => {
    const result = mapDeploymentStatusError(new Error('Invalid status value: "unknown"'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.INVALID_STATUS_VALUE);
    assert.equal(result.statusCode, 400);
  });

  it('preserves the original error message', () => {
    const msg = 'Invalid status value: "broken"';
    const result = mapDeploymentStatusError(new Error(msg));
    assert.equal(result.message, msg);
  });
});

describe('mapDeploymentStatusError — invalid deploymentId', () => {
  it('maps "deploymentId is required" to INVALID_DEPLOYMENT_ID with 400', () => {
    const result = mapDeploymentStatusError(
      new Error('deploymentId is required to update deployment status.'),
    );
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.INVALID_DEPLOYMENT_ID);
    assert.equal(result.statusCode, 400);
  });
});

describe('mapDeploymentStatusError — Supabase write failed', () => {
  it('maps "Failed to update" to SUPABASE_WRITE_FAILED with 500', () => {
    const result = mapDeploymentStatusError(
      new Error('Failed to update deployment status: DB timeout'),
    );
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.SUPABASE_WRITE_FAILED);
    assert.equal(result.statusCode, 500);
  });

  it('returns a helpful message', () => {
    const result = mapDeploymentStatusError(
      new Error('Failed to update deployment status: connection reset'),
    );
    assert.ok(result.message.toLowerCase().includes('persist'));
  });
});

describe('mapDeploymentStatusError — Supabase read failed', () => {
  it('maps "Failed to fetch" to SUPABASE_READ_FAILED with 500', () => {
    const result = mapDeploymentStatusError(
      new Error('Failed to fetch deployment status: timeout'),
    );
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.SUPABASE_READ_FAILED);
    assert.equal(result.statusCode, 500);
  });
});

describe('mapDeploymentStatusError — stream polling failed', () => {
  it('maps "polling" error to STREAM_POLLING_FAILED with 500', () => {
    const result = mapDeploymentStatusError(new Error('Status polling error.'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.STREAM_POLLING_FAILED);
    assert.equal(result.statusCode, 500);
  });

  it('maps "polling" keyword to STREAM_POLLING_FAILED', () => {
    const result = mapDeploymentStatusError(new Error('polling loop crashed'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.STREAM_POLLING_FAILED);
    assert.equal(result.statusCode, 500);
  });
});

describe('mapDeploymentStatusError — SSE connection dropped', () => {
  it('maps "write after end" to SSE_CONNECTION_DROPPED with 499', () => {
    const result = mapDeploymentStatusError(new Error('write after end'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.SSE_CONNECTION_DROPPED);
    assert.equal(result.statusCode, 499);
  });

  it('maps "ERR_HTTP_HEADERS_SENT" to SSE_CONNECTION_DROPPED with 499', () => {
    const result = mapDeploymentStatusError(new Error('ERR_HTTP_HEADERS_SENT'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.SSE_CONNECTION_DROPPED);
    assert.equal(result.statusCode, 499);
  });
});

describe('mapDeploymentStatusError — generic fallback', () => {
  it('maps unknown error to SUPABASE_READ_FAILED with 500', () => {
    const result = mapDeploymentStatusError(new Error('totally unexpected error'));
    assert.equal(result.code, DEPLOYMENT_STATUS_ERRORS.SUPABASE_READ_FAILED);
    assert.equal(result.statusCode, 500);
  });

  it('handles null error gracefully', () => {
    const result = mapDeploymentStatusError(null);
    assert.equal(typeof result.code, 'string');
    assert.equal(typeof result.message, 'string');
    assert.equal(typeof result.statusCode, 'number');
  });

  it('handles undefined error gracefully', () => {
    const result = mapDeploymentStatusError(undefined);
    assert.equal(typeof result.code, 'string');
    assert.equal(result.statusCode, 500);
  });

  it('handles error with no message property', () => {
    const result = mapDeploymentStatusError({});
    assert.ok(typeof result.message === 'string');
    assert.ok(result.message.length > 0);
  });
});

describe('DEPLOYMENT_STATUS_ERRORS enum', () => {
  it('contains all expected error code keys', () => {
    const expected = [
      'DEPLOYMENT_NOT_FOUND',
      'INVALID_STATUS_VALUE',
      'INVALID_DEPLOYMENT_ID',
      'SUPABASE_WRITE_FAILED',
      'SUPABASE_READ_FAILED',
      'STREAM_POLLING_FAILED',
      'SSE_CONNECTION_DROPPED',
    ];
    for (const key of expected) {
      assert.ok(
        key in DEPLOYMENT_STATUS_ERRORS,
        `Missing error code: ${key}`,
      );
    }
  });

  it('has exactly 7 error codes', () => {
    assert.equal(Object.keys(DEPLOYMENT_STATUS_ERRORS).length, 7);
  });
});
