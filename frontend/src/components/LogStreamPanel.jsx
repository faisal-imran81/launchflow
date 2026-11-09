// frontend/src/components/LogStreamPanel.jsx

import { useEffect, useRef } from 'react';
import { useLogStream } from '../hooks/useLogStream.js';

/**
 * Maps stream status to a human-readable badge label and color set.
 *
 * @param {'idle'|'connecting'|'live'|'reconnecting'|'done'|'error'} status
 * @returns {{ label: string, color: string, bg: string, border: string }}
 */
function getStatusBadge(status) {
  const map = {
    idle:         { label: 'Idle',          color: '#a0a0a8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)' },
    connecting:   { label: 'Connecting…',   color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)' },
    live:         { label: '● Live',         color: '#74c69d', bg: 'rgba(82,183,136,0.1)',   border: 'rgba(82,183,136,0.2)' },
    reconnecting: { label: 'Reconnecting…', color: '#fb923c', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.2)' },
    done:         { label: 'Done',           color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.2)' },
    error:        { label: 'Error',          color: '#fc8181', bg: 'rgba(229,62,62,0.1)',    border: 'rgba(229,62,62,0.2)' },
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
 * @param {string}      [props.className]  - Extra classes for wrapper
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

  const controlStyle = {
    padding: '3px 10px',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#a0a0a8',
    cursor: 'pointer',
    fontFamily: 'JetBrains Mono, monospace',
    transition: 'all 0.15s ease',
  };

  return (
    <div
      className={className}
      style={{
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        height: '380px',
      }}
    >

      {/* ── Header bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['#e53e3e', '#f59e0b', '#52b788'].map((c) => (
              <div
                key={c}
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }}
              />
            ))}
          </div>
          <span
            style={{
              color: '#5a5a62',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 500,
            }}
          >
            deployment logs
          </span>
          <span
            style={{
              padding: '2px 9px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: badge.color,
              background: badge.bg,
              border: `1px solid ${badge.border}`,
            }}
          >
            {badge.label}
          </span>
          <span
            style={{
              color: logs.length > 0 ? '#5a5a62' : '#3a3a42',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              transition: 'color 0.3s ease',
            }}
          >
            {logs.length} lines
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Pause / Resume */}
          <button
            onClick={isPaused ? resume : pause}
            style={controlStyle}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#f2f2f2'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = '#a0a0a8'
            }}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          {/* Clear buffer */}
          <button
            onClick={clear}
            style={controlStyle}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#f2f2f2'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = '#a0a0a8'
            }}
          >
            Clear
          </button>

          {/* Download logs */}
          <button
            onClick={handleDownload}
            disabled={logs.length === 0}
            style={{
              ...controlStyle,
              cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: logs.length === 0 ? 0.4 : 1,
            }}
            onMouseEnter={e => {
              if (logs.length > 0) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#f2f2f2'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = '#a0a0a8'
            }}
          >
            Download
          </button>

          {/* Manual reconnect — only shown when stream is not live */}
          {status !== 'live' && status !== 'connecting' && (
            <button
              onClick={reconnect}
              style={{
                ...controlStyle,
                border: '1px solid rgba(229,62,62,0.2)',
                background: 'rgba(229,62,62,0.08)',
                color: '#fc8181',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,62,62,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(229,62,62,0.08)' }}
            >
              ↺ Reconnect
            </button>
          )}
        </div>
      </div>

      {/* ── Log output area ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          fontSize: '12px',
          lineHeight: '1.8',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
        }}
      >
        {status === 'error' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              textAlign: 'center',
              padding: '24px',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(229,62,62,0.08)',
                border: '1px solid rgba(229,62,62,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 10 C3 6.13 6.13 3 10 3"
                  stroke="#e53e3e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="3 2"
                />
                <path
                  d="M17 10 C17 13.87 13.87 17 10 17 C6.13 17 3 13.87 3 10"
                  stroke="#e53e3e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M7 7 L13 13 M13 7 L7 13"
                  stroke="#e53e3e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <p style={{ color: '#fc8181', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                Stream connection lost
              </p>
              <p style={{ color: '#5a5a62', fontSize: '12px', lineHeight: '1.5' }}>
                Unable to connect to log stream.
                Check if the container is running.
              </p>
            </div>

            <button
              onClick={reconnect}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid rgba(229,62,62,0.2)',
                background: 'rgba(229,62,62,0.08)',
                color: '#fc8181',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'JetBrains Mono, monospace',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(229,62,62,0.14)';
                e.currentTarget.style.borderColor = 'rgba(229,62,62,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(229,62,62,0.08)';
                e.currentTarget.style.borderColor = 'rgba(229,62,62,0.2)';
              }}
            >
              ↺ Reconnect
            </button>
          </div>
        )}
        {logs.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: '8px',
              color: '#5a5a62',
            }}
          >
            {status === 'idle' && (
              <>
                <span style={{ fontSize: '20px' }}>📋</span>
                <p style={{ fontSize: '12px' }}>No container selected.</p>
              </>
            )}
            {status === 'connecting' && (
              <>
                <span className="animate-pulse" style={{ fontSize: '20px' }}>🔌</span>
                <p style={{ fontSize: '12px' }}>Connecting to log stream…</p>
              </>
            )}
            {status === 'live' && (
              <>
                <span className="animate-pulse" style={{ fontSize: '20px' }}>📡</span>
                <p style={{ fontSize: '12px' }}>Connected — waiting for first log line…</p>
              </>
            )}
            {status === 'reconnecting' && (
              <>
                <span className="animate-pulse" style={{ fontSize: '20px' }}>🔄</span>
                <p style={{ fontSize: '12px' }}>Reconnecting to log stream…</p>
              </>
            )}
            {status === 'done' && (
              <>
                <span style={{ fontSize: '20px' }}>✅</span>
                <p style={{ fontSize: '12px' }}>Stream ended — no logs were captured.</p>
              </>
            )}
            {status === 'error' && (
              <>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <p style={{ color: '#fc8181', fontSize: '12px' }}>
                  Stream error — check container status and reconnect.
                </p>
              </>
            )}
          </div>
        ) : (
          logs.map((entry, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
            >
              {/* Line number */}
              <span
                style={{
                  color: '#3a3a42',
                  fontSize: '10px',
                  userSelect: 'none',
                  minWidth: '28px',
                  textAlign: 'right',
                  paddingTop: '1px',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>
              {/* Timestamp */}
              <span style={{ flexShrink: 0, color: '#5a5a62', userSelect: 'none' }}>
                {formatTs(entry.ts)}
              </span>
              {/* Stream type tag */}
              <span style={{ flexShrink: 0, color: '#3a3a42', userSelect: 'none' }}>
                {entry.stream === 'stderr' ? '[err]' : '[out]'}
              </span>
              {/* Log line text */}
              <span
                style={{
                  color: entry.stream === 'stderr' ? '#e53e3e' : '#74c69d',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {entry.line}
              </span>
            </div>
          ))
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Footer — paused indicator ── */}
      {isPaused && (
        <div
          style={{
            padding: '6px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            color: '#fbbf24',
            background: 'rgba(245,158,11,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <span>⏸</span>
          <span>Stream paused — new lines are buffered. Click Resume to continue.</span>
        </div>
      )}
      {status === 'error' && !isPaused && (
        <div
          style={{
            padding: '6px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            color: '#fc8181',
            background: 'rgba(229,62,62,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <span>⚠️</span>
          <span>Stream disconnected — click Reconnect to retry.</span>
        </div>
      )}
    </div>
  );
}
