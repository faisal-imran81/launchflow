// frontend/src/hooks/useLogStream.js

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Maximum number of log lines to keep in state.
 * Prevents unbounded memory growth for long-running containers.
 */
const MAX_LOG_LINES = 1000;

/**
 * Delay in milliseconds before attempting SSE reconnection.
 * Increases with each failed attempt up to MAX_RECONNECT_DELAY.
 */
const BASE_RECONNECT_DELAY = 1500;
const MAX_RECONNECT_DELAY = 15000;

/**
 * Custom hook for consuming a LaunchFlow SSE log stream.
 * Manages EventSource lifecycle, reconnection with backoff,
 * and exposes pause/resume/clear controls to the caller.
 *
 * @param {string|null} containerId - Docker container ID to stream logs for.
 *                                    Pass null to keep the stream inactive.
 * @param {object}      [options]
 * @param {boolean}     [options.poll=false]      - Use polling fallback instead of SSE follow
 * @param {number}      [options.tail=50]          - Lines per poll cycle (polling mode only)
 * @param {number}     [options.interval=2000]    - Poll interval in ms (polling mode only)
 * @param {boolean}    [options.autoStart=true]   - Start streaming immediately on mount
 *
 * @returns {{
 *   logs: Array<{line: string, stream: string, ts: number}>,
 *   status: 'idle'|'connecting'|'live'|'reconnecting'|'done'|'error',
 *   isPaused: boolean,
 *   pause: () => void,
 *   resume: () => void,
 *   clear: () => void,
 *   reconnect: () => void,
 * }}
 */
export function useLogStream(containerId, options = {}) {
  const {
    poll = false,
    tail = 50,
    interval = 2000,
    autoStart = true,
  } = options;

  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle');
  const [isPaused, setIsPaused] = useState(false);

  // Refs so event handlers always read the latest values without re-subscribing
  const esRef = useRef(null);
  const isPausedRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const activeRef = useRef(false);

  /**
   * Build the SSE endpoint URL from containerId and options.
   */
  const buildUrl = useCallback(() => {
    if (!containerId) return null;
    const base = `/api/logs/${containerId}/stream`;
    const params = new URLSearchParams();
    if (poll) {
      params.set('poll', 'true');
      params.set('tail', String(tail));
      params.set('interval', String(interval));
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [containerId, poll, tail, interval]);

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
   * Open a new EventSource and wire up log, status, and error handlers.
   */
  const openStream = useCallback(() => {
    const url = buildUrl();
    if (!url || !activeRef.current) return;

    setStatus('connecting');
    const es = new EventSource(url);
    esRef.current = es;

    // Incoming log line from the server
    es.addEventListener('log', (e) => {
      if (isPausedRef.current) return;
      try {
        const payload = JSON.parse(e.data);
        setLogs((prev) => {
          const next = [...prev, payload];
          // Drop oldest lines if buffer exceeds cap
          return next.length > MAX_LOG_LINES
            ? next.slice(next.length - MAX_LOG_LINES)
            : next;
        });
      } catch {
        // Malformed JSON from server — skip silently
      }
    });

    // Terminal status event — done or error
    es.addEventListener('status', (e) => {
      try {
        const { status: s } = JSON.parse(e.data);
        setStatus(s === 'done' ? 'done' : 'error');
      } catch {
        setStatus('error');
      }
      es.close();
      esRef.current = null;
    });

    // EventSource connection opened successfully
    es.onopen = () => {
      setStatus('live');
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
      setStatus('reconnecting');

      reconnectTimerRef.current = setTimeout(() => {
        if (activeRef.current) openStream();
      }, delay);
    };
  }, [buildUrl, closeStream]);

  // Start or stop stream based on containerId and autoStart
  useEffect(() => {
    if (!containerId || !autoStart) {
      setStatus('idle');
      return;
    }

    activeRef.current = true;
    openStream();

    return () => {
      activeRef.current = false;
      closeStream();
    };
  }, [containerId, autoStart, openStream, closeStream]);

  /** Pause rendering new log lines (stream stays open). */
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  /** Resume rendering log lines. */
  const resume = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
  }, []);

  /** Clear all buffered log lines. */
  const clear = useCallback(() => {
    setLogs([]);
  }, []);

  /** Manually trigger a reconnection (resets backoff counter). */
  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0;
    closeStream();
    if (containerId) {
      activeRef.current = true;
      openStream();
    }
  }, [containerId, closeStream, openStream]);

  return { logs, status, isPaused, pause, resume, clear, reconnect };
}
