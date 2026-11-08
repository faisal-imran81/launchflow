import { useState } from 'react'
import { parseRepoInput } from '../utils/parseRepoInput'

const STORAGE_KEY = 'launchflow:lastRepoInput'

function readSavedInput() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function saveInput(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // storage can be blocked (private mode), the form still works without it
  }
}

export default function AutoDetectForm({ onSubmit, loading, busy }) {
  const [input, setInput] = useState(readSavedInput)
  const parsed = parseRepoInput(input)

  const handleSubmit = () => {
    if (!parsed) return
    saveInput(input.trim())
    onSubmit(parsed)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ color: '#a0a0a8', fontSize: '13px', fontWeight: 600 }}>
        🔍 Auto-detect from GitHub
      </h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="owner/repo (e.g. faisal-imran81/my-app)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
          style={{
            flex: 1,
            minWidth: '200px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '9px 12px',
            fontSize: '13px',
            color: '#f2f2f2',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(82,183,136,0.4)'
            e.target.style.boxShadow = '0 0 0 3px rgba(82,183,136,0.08)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !parsed}
          style={{
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(82,183,136,0.2)',
            background: 'rgba(82,183,136,0.08)',
            color: '#52b788',
            cursor: loading || !parsed ? 'not-allowed' : 'pointer',
            opacity: !parsed ? 0.5 : 1,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (!loading && parsed) {
              e.currentTarget.style.background = 'rgba(82,183,136,0.14)'
              e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.08)'
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)'
          }}
        >
          {busy ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            '🔍 Auto-detect & Generate All'
          )}
        </button>
      </div>
      {input && !parsed && (
        <p style={{ color: '#fbbf24', fontSize: '11px' }}>
          Format should be owner/repo (or a full GitHub URL)
        </p>
      )}
    </div>
  )
}
