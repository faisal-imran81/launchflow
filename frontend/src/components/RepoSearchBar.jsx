import { useState } from 'react'
import Spinner from './Spinner'

export default function RepoSearchBar({ onSearch, onClear, isLoading }) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim()) return
    onSearch(username.trim().toLowerCase())
  }

  const handleClear = () => {
    setUsername('')
    if (onClear) onClear()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        style={{
          display: 'block',
          color: '#5a5a62',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        GitHub Username
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              position: 'absolute',
              left: '11px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#5a5a62',
              pointerEvents: 'none',
            }}
          >
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. faisal-imran81"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '9px 32px 9px 32px',
              fontSize: '13px',
              color: '#f2f2f2',
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(82,183,136,0.4)'
              e.target.style.boxShadow = '0 0 0 3px rgba(82,183,136,0.08)'
              e.target.style.background = 'rgba(255,255,255,0.05)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)'
              e.target.style.boxShadow = 'none'
              e.target.style.background = 'rgba(255,255,255,0.04)'
            }}
          />
          {username && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#5a5a62',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
                padding: '0 2px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f2f2f2' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#5a5a62' }}
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          style={{
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(82,183,136,0.2)',
            background: 'rgba(82,183,136,0.08)',
            color: '#52b788',
            cursor: isLoading || !username.trim() ? 'not-allowed' : 'pointer',
            opacity: !username.trim() ? 0.5 : 1,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            if (!isLoading && username.trim()) {
              e.currentTarget.style.background = 'rgba(82,183,136,0.14)'
              e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.08)'
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)'
          }}
        >
          {isLoading ? <Spinner size="sm" color="green" /> : 'Search'}
        </button>
      </div>
    </form>
  )
}
