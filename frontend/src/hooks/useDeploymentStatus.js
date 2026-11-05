// frontend/src/hooks/useDeploymentStatus.js

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * All valid deployment pipeline status values.
 * Mirrors the backend DEPLOYMENT_STATUS enum.
 * @readonly
 */
export const DEPLOYMENT_STATUS = {
  QUEUED:     'queued',
  BUILDING:   'building',
  PUSHING:    'pushing',
  DEPLOYING:  'deploying',
  RUNNING:    'running',
  FAILED:     'failed',
  STOPPED:    'stopped',
};

/** Statuses that mean the deployment pipeline has finished. */
const TERMINAL_STATUSES = new Set([
  DEPLOYMENT_STATUS.RUNNING,
  DEPLOYMENT_STATUS.FAILED,
  DEPLOYMENT_STATUS.STOPPED,
]);

/** Base SSE reconnection delay in milliseconds. */
const BASE_RECONNECT_DELAY = 1500;

/** Maximum SSE reconnection delay in milliseconds. */
const MAX_RECONNECT_DELAY = 15000;

/**
 * Custom hook for tracking real-time deployment status via SSE.
 * Opens an EventSource to /api/status/:deploymentId/stream and
 * updates state on each status change event from the server.
 * Automatically closes when a terminal status is reached.
 *
 * @param {string|null} deploymentId - UUID of the deployment to track.
 *                                     Pass null to keep the hook inactive.
 * @param {object}      [options]
 * @param {number}      [options.interval=2000]   - Poll interval in ms (server-side)
 * @param {boolean}     [options.autoStart=true]  - Start tracking immediately
 *
 * @returns {{
 *   status: string|null,
 *   history: Array<{status: string, updatedAt: string}>,
 *   meta: { error: string|null, imageTag: string|null, containerId: string|null },
 *   streamStatus: 'idle'|'connecting'|'live'|'reconnecting'|'done'|'error',
 *   isTerminal: boolean,
 *   reconnect: () => void,
 * }}
 */
export function useDeploymentStatus(deploymentId, options = {}) {
  const { interval = 2000, autoStart = true } = options;

  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState({
    error: null,
    imageTag: null,
    containerId: null,
  });
  const [streamStatus, setStreamStatus] = useState('idle');

  const esRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const activeRef = useRef(false);

  /**
   * Build the SSE endpoint URL from deploymentId and options.
   */
  const buildUrl = useCallback(() => {
    if (!deploymentId) return null;
    return `/api/status/${deploymentId}/stream?interval=${interval}`;
  }, [deploymentId, interval]);

  /**
   * Close the current EventSource and clear any pending reconnect timer.
   */
  const closeStream = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  /**
   * Open a new EventSource and wire up status and error handlers.
   */
  const openStream = useCallback(() => {
    const url = buildUrl();
    if (!url || !activeRef.current) return;

    setStreamStatus('connecting');
    const es = new EventSource(url);
    esRef.current = es;

    // Incoming deployment status event from the server
    es.addEventListener('status', (e) => {
      try {
        const payload = JSON.parse(e.data);

        // Update current status
        setStatus(payload.status);

        // Append to status history
        setHistory((prev) => [
          ...prev,
          { status: payload.status, updatedAt: payload.updatedAt },
        ]);

        // Update metadata fields
        setMeta({
          error: payload.error ?? null,
          imageTag: payload.imageTag ?? null,
          containerId: payload.containerId ?? null,
        });

        // If terminal status reached — stream will close server-side too
        if (TERMINAL_STATUSES.has(payload.status)) {
          setStreamStatus('done');
          activeRef.current = false;
          es.close();
          esRef.current = null;
        }
      } catch {
        // Malformed JSON from server — skip silently
      }
    });

    // EventSource connection opened successfully
    es.onopen = () => {
      setStreamStatus('live');
      reconnectAttemptRef.current = 0;
    };

    // Network-level error — attempt reconnection with exponential backoff
    es.onerror = () => {
      es.close();
      esRef.current = null;

      if (!activeRef.current) return;

      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(
        BASE_RECONNECT_DELAY * 2 ** attempt,
        MAX_RECONNECT_DELAY,
      );
      reconnectAttemptRef.current += 1;
      setStreamStatus('reconnecting');

      reconnectTimerRef.current = setTimeout(() => {
        if (activeRef.current) openStream();
      }, delay);
    };
  }, [buildUrl, closeStream]);

  // Start or stop stream based on deploymentId and autoStart
  useEffect(() => {
    if (!deploymentId || !autoStart) {
      setStreamStatus('idle');
      return;
    }

    activeRef.current = true;
    openStream();

    return () => {
      activeRef.current = false;
      closeStream();
    };
  }, [deploymentId, autoStart, openStream, closeStream]);

  /** Manually trigger a reconnection — resets backoff counter. */
  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    closeStream();
    if (deploymentId) {
      activeRef.current = true;
      openStream();
    }
  }, [deploymentId, closeStream, openStream]);

  return {
    status,
    history,
    meta,
    streamStatus,
    isTerminal: status ? TERMINAL_STATUSES.has(status) : false,
    reconnect,
  };
}
