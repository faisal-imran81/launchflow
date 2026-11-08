import { useState } from 'react';
import Spinner from './Spinner';

const stacks = ['node', 'python', 'go', 'java', 'php', 'ruby', 'static'];

export default function ManualGenerateForm({ onSubmit, loading }) {
  const [stack, setStack]   = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = () => {
    if (!stack || !repoUrl.trim()) return;
    onSubmit?.({ stack, repoUrl: repoUrl.trim() });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Repo URL */}
      <div>
        <label
          style={{
            display: 'block',
            color: '#5a5a62',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
          }}
        >
          Repository URL
        </label>
        <input
          type="text"
          value={repoUrl}
          onChange={e => setRepoUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '9px 12px',
            fontSize: '13px',
            color: '#f2f2f2',
            outline: 'none',
            transition: 'all 0.15s ease',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(82,183,136,0.4)';
            e.target.style.boxShadow   = '0 0 0 3px rgba(82,183,136,0.08)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow   = 'none';
          }}
        />
      </div>

      {/* Stack selector */}
      <div>
        <label
          style={{
            display: 'block',
            color: '#5a5a62',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
          }}
        >
          Stack
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {stacks.map((s) => (
            <button
              key={s}
              onClick={() => setStack(s)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                border: stack === s
                  ? '1px solid rgba(82,183,136,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                background: stack === s
                  ? 'rgba(82,183,136,0.1)'
                  : 'rgba(255,255,255,0.03)',
                color: stack === s ? '#74c69d' : '#a0a0a8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textTransform: 'capitalize',
              }}
              onMouseEnter={e => {
                if (stack !== s) {
                  e.currentTarget.style.background    = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color         = '#f2f2f2';
                  e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.12)';
                }
              }}
              onMouseLeave={e => {
                if (stack !== s) {
                  e.currentTarget.style.background    = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color         = '#a0a0a8';
                  e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.08)';
                }
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !stack || !repoUrl.trim()}
        style={{
          width: '100%',
          padding: '9px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid rgba(82,183,136,0.2)',
          cursor: loading || !stack || !repoUrl.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'rgba(82,183,136,0.08)',
          color: '#52b788',
          opacity: !stack || !repoUrl.trim() ? 0.5 : 1,
        }}
        onMouseEnter={e => {
          if (!loading && stack && repoUrl.trim()) {
            e.currentTarget.style.background  = 'rgba(82,183,136,0.14)';
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background  = 'rgba(82,183,136,0.08)';
          e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)';
        }}
      >
        {loading ? (
          <>
            <Spinner size="sm" color="green" />
            Generating...
          </>
        ) : (
          'Generate Config'
        )}
      </button>
    </div>
  );
}
