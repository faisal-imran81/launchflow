// frontend/src/components/LogStreamPanel.jsx

import { useEffect, useRef } from 'react';
import { useLogStream } from '../hooks/useLogStream.js';

/**
 * Maps stream status to a human-readable badge label and Tailwind color class.
 *
 * @param {'idle'|'connecting'|'live'|'reconnecting'|'done'|'error'} status
 * @returns {{ label: string, className: string }}
 */
function getStatusBadge(status) {
  const map = {
    idle:         { label: 'Idle',         className: 'bg-zinc-700 text-zinc-300' },
    connecting:   { label: 'Connecting…',  className: 'bg-yellow-600 text-yellow-100' },
    live:         { label: '● Live',        className: 'bg-green-600 text-green-100' },
    reconnecting: { label: 'Reconnecting…',className: 'bg-orange-500 text-orange-100' },
    done:         { label: 'Done',          className: 'bg-blue-600 text-blue-100' },
    error:        { label: 'Error',         className: 'bg-red-600 text-red-100' },
  };
  return map[status] ?? map.idle;
}

/**
 * Formats a Unix timestamp (ms) to HH:MM:SS string.
 *
 * @param {number} ts - Milliseconds since epoch
 * @returns {string}
 */
function formatTs(ts) {
  return new Date(ts).toTimeString().slice(0, 8);
}

/**
 * LogStreamPanel — terminal-style real-time log viewer.
 * Consumes useLogStream and renders each log line with
 * timestamp, stream type badge, and ANSI-safe text.
 *
 * @param {object}      props
 * @param {string|null} props.containerId  - Docker container ID to stream
 * @param {boolean}     [props.poll=false] - Use polling fallback
 * @param {number}      [props.tail=50]    - Lines per poll cycle
 * @param {number}      [props.interval=2000] - Poll interval ms
 * @param {string}      [props.className]  - Extra Tailwind classes for wrapper
 */
export default function LogStreamPanel({
  containerId,
  poll = false,
  tail = 50,
  interval = 2000,
  className = '',
}) {
  const { logs, status, isPaused, pause, resume, clear, reconnect } =
    useLogStream(containerId, { poll, tail, interval, autoStart: !!containerId });

  // Auto-scroll to bottom whenever new log lines arrive and not paused
  const bottomRef = useRef(null);
  useEffect(() => {
    if (!isPaused && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const badge = getStatusBadge(status);

  /**
   * Download all current log lines as a plain .txt file.
   */
  function handleDownload() {
    const text = logs.map((l) => `[${formatTs(l.ts)}] ${l.line}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${containerId ?? 'stream'}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`flex flex-col rounded-xl border border-zinc-700 bg-zinc-900 ${className}`}>

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-200">Logs</span>
          {/* Stream status badge */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          {/* Log line count */}
          <span className="text-xs text-zinc-500">{logs.length} lines</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={isPaused ? resume : pause}
            className="px-3 py-1 text-xs rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          {/* Clear buffer */}
          <button
            onClick={clear}
            className="px-3 py-1 text-xs rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
          >
            Clear
          </button>

          {/* Download logs */}
          <button
            onClick={handleDownload}
            disabled={logs.length === 0}
            className="px-3 py-1 text-xs rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Download
          </button>

          {/* Manual reconnect — only shown when stream is not live */}
          {status !== 'live' && status !== 'connecting' && (
            <button
              onClick={reconnect}
              className="px-3 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* ── Log output area ── */}
      <div className="flex-1 overflow-y-auto max-h-96 px-4 py-3 font-mono text-xs leading-relaxed">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            {status === 'idle' && (
              <>
                <span className="text-2xl select-none">📋</span>
                <p className="text-zinc-500 text-xs select-none">
                  No container selected.
                </p>
              </>
            )}
            {status === 'connecting' && (
              <>
                <span className="text-2xl select-none animate-pulse">🔌</span>
                <p className="text-zinc-500 text-xs select-none">
                  Connecting to log stream…
                </p>
              </>
            )}
            {status === 'live' && (
              <>
                <span className="text-2xl select-none animate-pulse">📡</span>
                <p className="text-zinc-500 text-xs select-none">
                  Connected — waiting for first log line…
                </p>
              </>
            )}
            {status === 'reconnecting' && (
              <>
                <span className="text-2xl select-none animate-pulse">🔄</span>
                <p className="text-zinc-500 text-xs select-none">
                  Reconnecting to log stream…
                </p>
              </>
            )}
            {status === 'done' && (
              <>
                <span className="text-2xl select-none">✅</span>
                <p className="text-zinc-500 text-xs select-none">
                  Stream ended — no logs were captured.
                </p>
              </>
            )}
            {status === 'error' && (
              <>
                <span className="text-2xl select-none">⚠️</span>
                <p className="text-red-400 text-xs select-none">
                  Stream error — check container status and reconnect.
                </p>
              </>
            )}
          </div>
        ) : (
          logs.map((entry, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${
                entry.stream === 'stderr' ? 'text-red-400' : 'text-green-300'
              }`}
            >
              {/* Timestamp */}
              <span className="shrink-0 text-zinc-500 select-none">
                {formatTs(entry.ts)}
              </span>
              {/* Stream type tag */}
              <span className="shrink-0 text-zinc-600 select-none">
                {entry.stream === 'stderr' ? '[err]' : '[out]'}
              </span>
              {/* Log line text */}
              <span className="break-all whitespace-pre-wrap">{entry.line}</span>
            </div>
          ))
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Footer — paused indicator ── */}
      {isPaused && (
        <div className="px-4 py-1.5 border-t border-zinc-700 text-xs text-yellow-400 bg-zinc-800 rounded-b-xl flex items-center gap-2">
          <span>⏸</span>
          <span>Stream paused — new lines are buffered. Click Resume to continue.</span>
        </div>
      )}
      {status === 'error' && !isPaused && (
        <div className="px-4 py-1.5 border-t border-zinc-700 text-xs text-red-400 bg-zinc-800 rounded-b-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>Stream disconnected — click Reconnect to retry.</span>
        </div>
      )}
    </div>
  );
}
