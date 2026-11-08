import { useState } from 'react';

function CopyButton({ text, copied, onCopy, id }) {
  return (
    <button
      onClick={() => onCopy(text, id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        border: copied === id
          ? '1px solid rgba(82,183,136,0.3)'
          : '1px solid rgba(255,255,255,0.08)',
        background: copied === id
          ? 'rgba(82,183,136,0.1)'
          : 'rgba(255,255,255,0.04)',
        color: copied === id ? '#74c69d' : '#5a5a62',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        if (copied !== id) {
          e.currentTarget.style.background   = 'rgba(255,255,255,0.07)';
          e.currentTarget.style.color        = '#a0a0a8';
          e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.12)';
        }
      }}
      onMouseLeave={e => {
        if (copied !== id) {
          e.currentTarget.style.background   = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color        = '#5a5a62';
          e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.08)';
        }
      }}
    >
      {copied === id ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5 L4.5 7.5 L8 3" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M1 7 L1 1 L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ content, copied, onCopy, id }) {
  return (
    <div
      style={{
        background: '#0c0c0c',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Code header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#e53e3e', '#f59e0b', '#52b788'].map((c) => (
            <div
              key={c}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.6 }}
            />
          ))}
        </div>
        <CopyButton text={content} copied={copied} onCopy={onCopy} id={id} />
      </div>

      {/* Code content */}
      <pre
        style={{
          margin: 0,
          padding: '16px',
          fontSize: '12px',
          lineHeight: '1.7',
          color: '#a0a0a8',
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          overflowX: 'auto',
          maxHeight: '320px',
          overflowY: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {content}
      </pre>
    </div>
  );
}

const tabs = [
  { key: 'dockerfile', label: 'Dockerfile' },
  { key: 'workflow',   label: 'workflow.yml' },
];

export default function OutputTabs({ dockerfile, workflow, copied, onCopy }) {
  const [active, setActive] = useState(dockerfile ? 'dockerfile' : 'workflow');

  const content = active === 'dockerfile' ? dockerfile : workflow;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          padding: '3px',
          gap: '2px',
        }}
      >
        {tabs.map(({ key, label }) => {
          const hasContent = key === 'dockerfile' ? !!dockerfile : !!workflow;
          return (
            <button
              key={key}
              onClick={() => hasContent && setActive(key)}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: hasContent ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                background: active === key
                  ? 'rgba(82,183,136,0.1)'
                  : 'transparent',
                color: active === key
                  ? '#74c69d'
                  : hasContent
                  ? '#5a5a62'
                  : '#3a3a42',
                fontFamily: 'JetBrains Mono, monospace',
                opacity: hasContent ? 1 : 0.4,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Code block */}
      {content ? (
        <CodeBlock
          content={content}
          copied={copied}
          onCopy={onCopy}
          id={active}
        />
      ) : (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#5a5a62',
            fontSize: '13px',
          }}
        >
          No output yet for this tab
        </div>
      )}
    </div>
  );
}
