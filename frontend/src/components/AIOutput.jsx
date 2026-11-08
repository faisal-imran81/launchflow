import { useState } from 'react';
import OutputTabs from './OutputTabs';

export default function AIOutput({ dockerfile, workflow, loading }) {
  const [copied, setCopied] = useState(null);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[120, 80, 100].map((w, i) => (
          <div
            key={i}
            style={{
              height: '14px',
              width: `${w}%`,
              maxWidth: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '700px 100%',
              animation: 'shimmer 1.8s infinite linear',
            }}
          />
        ))}
      </div>
    );
  }

  if (!dockerfile && !workflow) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          gap: '10px',
          opacity: 0.5,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#5a5a62" strokeWidth="1.5" strokeDasharray="4 3"/>
          <path d="M16 10 L16 16 M16 20 L16 21" stroke="#5a5a62" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p style={{ color: '#5a5a62', fontSize: '13px', textAlign: 'center' }}>
          Generate a config to see output here
        </p>
      </div>
    );
  }

  return (
    <OutputTabs
      dockerfile={dockerfile}
      workflow={workflow}
      copied={copied}
      onCopy={handleCopy}
    />
  );
}
