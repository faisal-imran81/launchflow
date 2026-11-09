import { useState } from 'react'
import EmptyState from './EmptyState'

export default function RepoList({ repos, onSelect, selectedRepo, searched }) {
  const [filter, setFilter] = useState('')

  if (!searched) return null

  if (repos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          gap: '10px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#5a5a62" strokeWidth="1.5"/>
            <path d="M13 13 L17 17" stroke="#5a5a62" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 8 L10 8M8 6 L8 10" stroke="#5a5a62" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ color: '#5a5a62', fontSize: '13px', fontWeight: 500 }}>
          No repositories found
        </p>
        <p style={{ color: '#3a3a42', fontSize: '12px', lineHeight: '1.5' }}>
          Check the username and try again
        </p>
      </div>
    )
  }

  const filtered = repos.filter((repo) =>
    repo.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label
          style={{
            color: '#5a5a62',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Select Repository
        </label>
        <span
          style={{
            color: '#3a3a42',
            fontSize: '11px',
            textAlign: 'right',
            paddingTop: '6px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {repos.length} repos found
        </span>
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter repositories..."
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '7px',
          padding: '7px 11px',
          fontSize: '12px',
          color: '#f2f2f2',
          outline: 'none',
          transition: 'all 0.15s ease',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(82,183,136,0.35)'
          e.target.style.boxShadow = '0 0 0 3px rgba(82,183,136,0.07)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.07)'
          e.target.style.boxShadow = 'none'
        }}
      />

      {filtered.length === 0 ? (
        <div
          style={{
            padding: '20px 16px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#5a5a62', fontSize: '13px' }}>
            No repositories match{' '}
            <span style={{ color: '#a0a0a8', fontStyle: 'italic' }}>
              "{searched}"
            </span>
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '192px',
            overflowY: 'auto',
            paddingRight: '2px',
          }}
        >
          {filtered.map((repo) => {
            const isSelected = selectedRepo?.id === repo.id
            return (
              <button
                key={repo.id}
                type="button"
                onClick={() => onSelect(repo)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isSelected
                    ? '1px solid rgba(82,183,136,0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected
                    ? 'rgba(82,183,136,0.07)'
                    : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ color: isSelected ? '#52b788' : '#5a5a62', flexShrink: 0 }}
                  >
                    <path
                      d="M2 2.5C2 1.67 2.67 1 3.5 1h9C13.33 1 14 1.67 14 2.5v11a.5.5 0 01-.777.416L8 10.101l-5.223 3.815A.5.5 0 012 13.5v-11z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        color: isSelected ? '#74c69d' : '#f2f2f2',
                        fontSize: '13px',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {repo.name}
                    </p>
                    {repo.description && (
                      <p
                        style={{
                          color: '#5a5a62',
                          fontSize: '11px',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {repo.description}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {repo.language && (
                    <span
                      style={{
                        color: '#5a5a62',
                        fontSize: '11px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '1px 7px',
                        borderRadius: '999px',
                        fontWeight: 500,
                      }}
                    >
                      {repo.language}
                    </span>
                  )}
                  <span style={{ color: '#5a5a62', fontSize: '11px' }}>⭐ {repo.stars}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="rgba(82,183,136,0.2)" stroke="#52b788" strokeWidth="1.2"/>
                      <path d="M4 7 L6.5 9.5 L10 5" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
