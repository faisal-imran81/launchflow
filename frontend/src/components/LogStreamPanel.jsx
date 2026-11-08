import { useEffect, useRef, useState } from 'react';
import { useLogStream } from '../hooks/useLogStream';

export default function LogStreamPanel({ containerId, deploymentId }) {
  const { logs, status, pause, resume, reconnect, isPaused } = useLogStream({
    containerId,
    deploymentId,
  });

  const bottomRef  = useRef(null);
  const panelRef   = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Detect manual scroll up — disable autoscroll
  const handleScroll = () => {
    const el = panelRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    setAutoScroll(atBottom);
  };

  const isConnected    = status === 'live';
  const isConnecting   = status === 'connecting' || status === 'reconnecting';
  const isDisconnected = status === 'idle' || status === 'done' || status === 'error';

  const statusDot = isConnected
    ? { color: '#52b788', shadow: '0 0 6px rgba(82,183,136,0.6)', label: 'Live' }
    : isConnecting
    ? { color: '#f59e0b', shadow: '0 0 6px rgba(245,158,11,0.5)', label: 'Connecting...' }
    : { color: '#e53e3e', shadow: '0 0 6px rgba(229,62,62,0.5)', label: 'Disconnected' };

  return (
    <div
      style={{
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        height: '380px',
      }}
    >
      {/* Terminal header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {/* Left — macOS dots + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['#e53e3e', '#f59e0b', '#52b788'].map((c) => (
              <div
                key={c}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: c,
                  opacity: 0.7,
                }}
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
        </div>

        {/* Right — status + controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: statusDot.color,
                boxShadow: statusDot.shadow,
                display: 'inline-block',
              }}
            />
            <span
              style={{
                color: statusDot.color,
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {statusDot.label}
            </span>
          </div>

          {/* Pause / Resume */}
          {isConnected && (
            <button
              onClick={isPaused ? resume : pause}
              style={{
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
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background   = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color        = '#f2f2f2';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background   = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color        = '#a0a0a8';
              }}
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}

          {/* Reconnect */}
          {isDisconnected && (
            <button
              onClick={reconnect}
              style={{
                padding: '3px 10px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(229,62,62,0.2)',
                background: 'rgba(229,62,62,0.08)',
                color: '#fc8181',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(229,62,62,0.14)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(229,62,62,0.08)';
              }}
            >
              ↺ Reconnect
            </button>
          )}

          {/* Log count */}
          <span
            style={{
              color: '#3a3a42',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {logs.length} lines
          </span>
        </div>
      </div>

      {/* Log body */}
      <div
        ref={panelRef}
        onScroll={handleScroll}
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
        {logs.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#3a3a42',
              paddingTop: '8px',
            }}
          >
            <span style={{ color: '#52b788' }}>$</span>
            <span>Waiting for logs</span>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '14px',
                background: '#52b788',
                opacity: 0.7,
                animation: 'fadeIn 0.8s ease infinite alternate',
              }}
            />
          </div>
        ) : (
          logs.map((entry, i) => {
            const line      = typeof entry === 'string' ? entry : entry.line ?? '';
            const isError   = /error|fail|fatal|exception/i.test(line);
            const isSuccess = /success|done|complete|running|started/i.test(line);
            const isWarn    = /warn|warning/i.test(line);
            const isStep    = line.startsWith('>>') || line.startsWith('==');

            const color = isError
              ? '#e53e3e'
              : isSuccess
              ? '#52b788'
              : isWarn
              ? '#f59e0b'
              : isStep
              ? '#74c69d'
              : '#a0a0a8';

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
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
                  {i + 1}
                </span>
                <span style={{ color, wordBreak: 'break-all' }}>
                  {line}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom hint */}
      {!autoScroll && logs.length > 0 && (
        <div
          style={{
            padding: '6px 14px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              setAutoScroll(true);
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontSize: '11px',
              color: '#52b788',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            ↓ Jump to latest
          </button>
        </div>
      )}
    </div>
  );
}
