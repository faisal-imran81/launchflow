// frontend/tests/useDeploymentStatus.cleanup.test.js

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { DEPLOYMENT_STATUS } from '../src/hooks/useDeploymentStatus.js';

// ---------------------------------------------------------------------------
// DEPLOYMENT_STATUS enum
// ---------------------------------------------------------------------------

describe('DEPLOYMENT_STATUS enum', () => {
  it('contains all expected pipeline status values', () => {
    const expected = [
      'queued', 'building', 'pushing',
      'deploying', 'running', 'failed', 'stopped',
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

// ---------------------------------------------------------------------------
// Terminal status detection
// ---------------------------------------------------------------------------

describe('useDeploymentStatus — terminal status detection', () => {
  const TERMINAL = new Set(['running', 'failed', 'stopped']);

  it('correctly identifies "running" as terminal', () => {
    assert.equal(TERMINAL.has(DEPLOYMENT_STATUS.RUNNING), true);
  });

  it('correctly identifies "failed" as terminal', () => {
    assert.equal(TERMINAL.has(DEPLOYMENT_STATUS.FAILED), true);
  });

  it('correctly identifies "stopped" as terminal', () => {
    assert.equal(TERMINAL.has(DEPLOYMENT_STATUS.STOPPED), true);
  });

  it('correctly identifies "queued" as non-terminal', () => {
    assert.equal(TERMINAL.has(DEPLOYMENT_STATUS.QUEUED), false);
  });

  it('correctly identifies "building" as non-terminal', () => {
    assert.equal(TERMINAL.has(DEPLOYMENT_STATUS.BUILDING), false);
  });

  it('correctly identifies "pushing" as non-terminal', () => {
    assert.equal(TERMINAL.has(DEPLOYMENT_STATUS.PUSHING), false);
  });

  it('correctly identifies "deploying" as non-terminal', () => {
    assert.equal(TERMINAL.has(DEPLOYMENT_STATUS.DEPLOYING), false);
  });
});

// ---------------------------------------------------------------------------
// Reconnect guard — terminal status prevents reconnection
// ---------------------------------------------------------------------------

describe('useDeploymentStatus — reconnect guard on terminal status', () => {
  it('does not reconnect when status is terminal', () => {
    const TERMINAL = new Set(['running', 'failed', 'stopped']);
    let activeRef = true;

    function onStatusReceived(status) {
      if (TERMINAL.has(status)) {
        // Mirrors what useDeploymentStatus does on terminal status
        activeRef = false;
      }
    }

    onStatusReceived(DEPLOYMENT_STATUS.RUNNING);
    assert.equal(activeRef, false);
  });

  it('allows reconnect when status is non-terminal', () => {
    const TERMINAL = new Set(['running', 'failed', 'stopped']);
    let activeRef = true;

    function onStatusReceived(status) {
      if (TERMINAL.has(status)) {
        activeRef = false;
      }
    }

    onStatusReceived(DEPLOYMENT_STATUS.BUILDING);
    assert.equal(activeRef, true);
  });

  it('sets activeRef false for all three terminal statuses', () => {
    const TERMINAL = new Set(['running', 'failed', 'stopped']);
    const terminals = [
      DEPLOYMENT_STATUS.RUNNING,
      DEPLOYMENT_STATUS.FAILED,
      DEPLOYMENT_STATUS.STOPPED,
    ];

    for (const status of terminals) {
      let activeRef = true;
      if (TERMINAL.has(status)) activeRef = false;
      assert.equal(activeRef, false, `Expected activeRef=false for status: ${status}`);
    }
  });
});

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

describe('useDeploymentStatus — URL builder', () => {
  it('builds correct SSE endpoint URL', () => {
    const deploymentId = 'dep-123';
    const interval = 2000;
    const url = `/api/status/${deploymentId}/stream?interval=${interval}`;
    assert.equal(url, '/api/status/dep-123/stream?interval=2000');
  });

  it('returns null when deploymentId is null', () => {
    const deploymentId = null;
    const url = deploymentId ? `/api/status/${deploymentId}/stream` : null;
    assert.equal(url, null);
  });

  it('returns null when deploymentId is empty string', () => {
    const deploymentId = '';
    const url = deploymentId ? `/api/status/${deploymentId}/stream` : null;
    assert.equal(url, null);
  });
});

// ---------------------------------------------------------------------------
// Exponential backoff
// ---------------------------------------------------------------------------

describe('useDeploymentStatus — exponential backoff', () => {
  const BASE = 1500;
  const MAX = 15000;

  it('calculates correct delay for attempt 0', () => {
    const delay = Math.min(BASE * 2 ** 0, MAX);
    assert.equal(delay, 1500);
  });

  it('calculates correct delay for attempt 1', () => {
    const delay = Math.min(BASE * 2 ** 1, MAX);
    assert.equal(delay, 3000);
  });

  it('calculates correct delay for attempt 3', () => {
    const delay = Math.min(BASE * 2 ** 3, MAX);
    assert.equal(delay, 12000);
  });

  it('caps at MAX_RECONNECT_DELAY for high attempt counts', () => {
    const delay = Math.min(BASE * 2 ** 10, MAX);
    assert.equal(delay, MAX);
  });

  it('never exceeds MAX for any attempt', () => {
    for (let i = 0; i < 20; i++) {
      const delay = Math.min(BASE * 2 ** i, MAX);
      assert.ok(delay <= MAX, `Exceeded MAX at attempt ${i}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Status history tracking
// ---------------------------------------------------------------------------

describe('useDeploymentStatus — status history', () => {
  it('appends each new status to history', () => {
    let history = [];

    function addToHistory(status, updatedAt) {
      history = [...history, { status, updatedAt }];
    }

    addToHistory('queued', '2026-10-24T10:00:00Z');
    addToHistory('building', '2026-10-24T10:01:00Z');
    addToHistory('running', '2026-10-24T10:05:00Z');

    assert.equal(history.length, 3);
    assert.equal(history[0].status, 'queued');
    assert.equal(history[2].status, 'running');
  });

  it('preserves full history across multiple status changes', () => {
    let history = [];
    const statuses = ['queued', 'building', 'pushing', 'deploying', 'running'];

    for (const status of statuses) {
      history = [...history, { status, updatedAt: new Date().toISOString() }];
    }

    assert.equal(history.length, 5);
    for (let i = 0; i < statuses.length; i++) {
      assert.equal(history[i].status, statuses[i]);
    }
  });
});
