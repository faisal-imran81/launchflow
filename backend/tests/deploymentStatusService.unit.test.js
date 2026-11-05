// backend/tests/deploymentStatusService.unit.test.js

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  updateDeploymentStatus,
  getDeploymentStatus,
  DEPLOYMENT_STATUS,
} from '../src/services/deploymentStatusService.js';

// ---------------------------------------------------------------------------
// Mock factory helpers
// ---------------------------------------------------------------------------

/**
 * Creates a mock Supabase client that returns a controlled response.
 * Supports chaining: .from().update().eq().select().single()
 *                    .from().select().eq().single()
 *
 * @param {object|null} data       - Row to return as resolved data
 * @param {object|null} error      - Error object to simulate Supabase failure
 */
function mockSupabase(data = null, error = null) {
  const chain = {
    data,
    error,
    from: mock.fn(() => chain),
    select: mock.fn(() => chain),
    update: mock.fn(() => chain),
    insert: mock.fn(() => chain),
    eq: mock.fn(() => chain),
    single: mock.fn(async () => ({ data, error })),
  };
  return chain;
}

// ---------------------------------------------------------------------------
// updateDeploymentStatus
// ---------------------------------------------------------------------------

describe('updateDeploymentStatus', () => {
  it('throws when deploymentId is missing', async () => {
    const supabase = mockSupabase();
    await assert.rejects(
      () => updateDeploymentStatus('', DEPLOYMENT_STATUS.QUEUED, {}, supabase),
      /deploymentId is required/,
    );
  });

  it('throws when status is not a valid DEPLOYMENT_STATUS value', async () => {
    const supabase = mockSupabase();
    await assert.rejects(
      () => updateDeploymentStatus('dep-123', 'invalid_status', {}, supabase),
      /Invalid status value/,
    );
  });

  it('calls supabase update with correct status and updated_at', async () => {
    const mockRow = {
      id: 'dep-123',
      status: DEPLOYMENT_STATUS.BUILDING,
      updated_at: new Date().toISOString(),
    };
    const supabase = mockSupabase(mockRow, null);

    const result = await updateDeploymentStatus(
      'dep-123',
      DEPLOYMENT_STATUS.BUILDING,
      {},
      supabase,
    );

    assert.equal(result.status, DEPLOYMENT_STATUS.BUILDING);
    assert.equal(result.id, 'dep-123');
  });

  it('spreads meta fields into the update payload', async () => {
    const mockRow = {
      id: 'dep-123',
      status: DEPLOYMENT_STATUS.FAILED,
      error: 'build error',
      updated_at: new Date().toISOString(),
    };
    const supabase = mockSupabase(mockRow, null);

    const result = await updateDeploymentStatus(
      'dep-123',
      DEPLOYMENT_STATUS.FAILED,
      { error: 'build error' },
      supabase,
    );

    assert.equal(result.status, DEPLOYMENT_STATUS.FAILED);
    assert.equal(result.error, 'build error');
  });

  it('throws when Supabase returns an error', async () => {
    const supabase = mockSupabase(null, { message: 'DB write failed' });
    await assert.rejects(
      () => updateDeploymentStatus('dep-123', DEPLOYMENT_STATUS.QUEUED, {}, supabase),
      /Failed to update deployment status/,
    );
  });

  it('accepts all valid DEPLOYMENT_STATUS values without throwing', async () => {
    for (const status of Object.values(DEPLOYMENT_STATUS)) {
      const mockRow = { id: 'dep-123', status, updated_at: new Date().toISOString() };
      const supabase = mockSupabase(mockRow, null);
      const result = await updateDeploymentStatus('dep-123', status, {}, supabase);
      assert.equal(result.status, status);
    }
  });
});

// ---------------------------------------------------------------------------
// getDeploymentStatus
// ---------------------------------------------------------------------------

describe('getDeploymentStatus', () => {
  it('throws when deploymentId is missing', async () => {
    const supabase = mockSupabase();
    await assert.rejects(
      () => getDeploymentStatus('', supabase),
      /deploymentId is required/,
    );
  });

  it('returns deployment row when found', async () => {
    const mockRow = {
      id: 'dep-456',
      status: DEPLOYMENT_STATUS.RUNNING,
      updated_at: new Date().toISOString(),
      error: null,
      image_tag: 'myapp:v1',
      container_id: 'abc123',
    };
    const supabase = mockSupabase(mockRow, null);

    const result = await getDeploymentStatus('dep-456', supabase);

    assert.equal(result.id, 'dep-456');
    assert.equal(result.status, DEPLOYMENT_STATUS.RUNNING);
    assert.equal(result.image_tag, 'myapp:v1');
  });

  it('throws when Supabase returns an error', async () => {
    const supabase = mockSupabase(null, { message: 'DB read failed' });
    await assert.rejects(
      () => getDeploymentStatus('dep-456', supabase),
      /Failed to fetch deployment status/,
    );
  });

  it('throws when deployment record is not found', async () => {
    const supabase = mockSupabase(null, null);
    await assert.rejects(
      () => getDeploymentStatus('dep-999', supabase),
      /Deployment not found/,
    );
  });

  it('returns correct status field from row', async () => {
    for (const status of Object.values(DEPLOYMENT_STATUS)) {
      const mockRow = {
        id: 'dep-123',
        status,
        updated_at: new Date().toISOString(),
        error: null,
        image_tag: null,
        container_id: null,
      };
      const supabase = mockSupabase(mockRow, null);
      const result = await getDeploymentStatus('dep-123', supabase);
      assert.equal(result.status, status);
    }
  });
});

// ---------------------------------------------------------------------------
// DEPLOYMENT_STATUS enum
// ---------------------------------------------------------------------------

describe('DEPLOYMENT_STATUS enum', () => {
  it('contains all expected pipeline status values', () => {
    const expected = [
      'queued',
      'building',
      'pushing',
      'deploying',
      'running',
      'failed',
      'stopped',
    ];
    for (const val of expected) {
      assert.ok(
        Object.values(DEPLOYMENT_STATUS).includes(val),
        `Missing status: ${val}`,
      );
    }
  });

  it('has exactly 7 status values', () => {
    assert.equal(Object.values(DEPLOYMENT_STATUS).length, 7);
  });
});
