import { useEffect } from 'react'

export default function SuccessToast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onDismiss()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        background: 'rgba(12,12,12,0.95)',
        border: '1px solid rgba(82,183,136,0.25)',
        borderRadius: '10px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(82,183,136,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'slideUp 0.25s ease-out',
        zIndex: 9999,
        maxWidth: '360px',
      }}
    >
      <span
        aria-hidden="true"
        className="text-lg"
        style={{
          color: '#52b788',
          flexShrink: 0,
        }}
      >
        ✓
      </span>
      <p
        className="text-sm font-medium"
        style={{
          color: '#f2f2f2',
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: '1.4',
        }}
      >
        {message}
      </p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-green-400 hover:text-green-300 text-xs ml-2 leading-none"
        style={{
          color: '#5a5a62',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: '0 2px',
          marginLeft: '4px',
          flexShrink: 0,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#e53e3e' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a5a62' }}
      >
        ✕
      </button>
    </div>
  )
}
