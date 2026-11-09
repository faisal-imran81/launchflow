import { useState } from 'react'

export default function ErrorAlert({ message, onDismiss, onRetry }) {
  const [countdown, setCountdown] = useState(null);

  const startCountdown = (seconds = 5) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onRetry?.();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(229,62,62,0.07)',
        border: '1px solid rgba(229,62,62,0.2)',
        borderRadius: '10px',
        animation: 'slideUp 0.2s ease-out',
      }}
    >
      <div
        className="flex items-start gap-2 min-w-0"
        style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}
      >
        <span
          aria-hidden="true"
          className="text-red-400 text-sm mt-0.5 shrink-0"
          style={{ color: '#e53e3e', flexShrink: 0, marginTop: '1px' }}
        >
          ⚠️
        </span>
        <p
          className="text-red-400 text-sm break-words"
          style={{ color: '#fc8181', fontSize: '13px', lineHeight: '1.5', fontWeight: 500 }}
        >
          {message}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {onRetry && (
          <button
            onClick={() => startCountdown(5)}
            className="text-red-400 hover:text-red-300 text-xs underline underline-offset-2"
            style={{
              color: '#fc8181',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              marginTop: '4px',
              transition: 'color 0.15s ease',
            }}
          >
            Try again
          </button>
        )}
        {countdown !== null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid rgba(229,62,62,0.2)',
                borderTopColor: '#e53e3e',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
              }}
            />
            <span style={{ color: '#5a5a62', fontSize: '12px' }}>
              Retrying in {countdown}s...
            </span>
          </div>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-red-400 hover:text-red-300 text-xs leading-none"
            style={{
              color: '#5a5a62',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: '0 2px',
              flexShrink: 0,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e53e3e' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5a5a62' }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
