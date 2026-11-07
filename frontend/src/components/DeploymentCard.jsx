import { Link } from 'react-router-dom';

const statusColors = {
  pending:   { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  text: '#fbbf24' },
  cloning:   { dot: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa' },
  building:  { dot: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa' },
  pushing:   { dot: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)',   text: '#22d3ee' },
  deploying: { dot: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)',  text: '#fb923c' },
  running:   { dot: '#52b788', bg: 'rgba(82,183,136,0.1)',  border: 'rgba(82,183,136,0.2)',  text: '#52b788' },
  failed:    { dot: '#e53e3e', bg: 'rgba(229,62,62,0.1)',   border: 'rgba(229,62,62,0.2)',   text: '#e53e3e' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DeploymentCard({ deployment }) {
  if (!deployment) return null;

  const {
    id,
    repo_url,
    status = 'pending',
    created_at,
    stack,
    image_tag,
  } = deployment;

  const c = statusColors[status] ?? statusColors.pending;

  const repoName = repo_url
    ? repo_url.replace('https://github.com/', '').replace('http://github.com/', '')
    : 'Unknown repository';

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '18px',
        transition: 'all 0.2s ease',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Repo name */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: '#5a5a62', flexShrink: 0 }}>
              <path d="M8 1C4.13 1 1 4.13 1 8c0 3.09 2.01 5.72 4.79 6.65.35.06.48-.15.48-.34v-1.19c-1.95.42-2.36-.94-2.36-.94-.32-.81-.78-1.03-.78-1.03-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.56-.18-3.2-.78-3.2-3.47 0-.77.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.72A6.63 6.63 0 018 4.8c.59 0 1.19.08 1.75.23 1.33-.9 1.92-.72 1.92-.72.38.96.14 1.67.07 1.85.45.49.72 1.11.72 1.88 0 2.7-1.64 3.29-3.21 3.46.25.22.48.64.48 1.29v1.92c0 .19.13.4.48.33A7.001 7.001 0 0015 8c0-3.87-3.13-7-7-7z" fill="currentColor"/>
            </svg>
            <p
              style={{
                color: '#f2f2f2',
                fontSize: '13px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {repoName}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3">
            {stack && (
              <span
                style={{
                  color: '#5a5a62',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1px 8px',
                  borderRadius: '999px',
                }}
              >
                {stack}
              </span>
            )}
            <span style={{ color: '#5a5a62', fontSize: '12px' }}>
              {timeAgo(created_at)}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <span
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            color: c.text,
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flexShrink: 0,
            textTransform: 'capitalize',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: c.dot,
              boxShadow: status === 'running'
                ? `0 0 6px ${c.dot}`
                : 'none',
              flexShrink: 0,
            }}
          />
          {status}
        </span>
      </div>

      {/* Bottom row */}
      {image_tag && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '10px',
            marginTop: '4px',
          }}
        >
          <p
            style={{
              color: '#5a5a62',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {image_tag}
          </p>
        </div>
      )}
    </div>
  );
}
