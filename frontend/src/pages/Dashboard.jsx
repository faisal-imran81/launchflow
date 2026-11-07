import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useHistory } from '../hooks/useHistory';
import SkeletonCard from '../components/SkeletonCard';

const statCards = (projects, deployments) => [
  {
    label: 'Total Projects',
    value: projects?.length ?? 0,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    accent: '#52b788',
  },
  {
    label: 'Total Deployments',
    value: deployments?.length ?? 0,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2 L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 5 L9 2 L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 13 C3 14.1 3.9 15 5 15 L13 15 C14.1 15 15 14.1 15 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    accent: '#52b788',
  },
  {
    label: 'Running',
    value: deployments?.filter(d => d.status === 'running').length ?? 0,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 6 L13 9 L7 12 Z" fill="currentColor"/>
      </svg>
    ),
    accent: '#52b788',
  },
  {
    label: 'Failed',
    value: deployments?.filter(d => d.status === 'failed').length ?? 0,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 6 L12 12M12 6 L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    accent: '#e53e3e',
  },
];

const statusColors = {
  pending:   { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  text: '#fbbf24' },
  cloning:   { bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  text: '#60a5fa' },
  building:  { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#a78bfa' },
  pushing:   { bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)',   text: '#22d3ee' },
  deploying: { bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)',  text: '#fb923c' },
  running:   { bg: 'rgba(82,183,136,0.1)',  border: 'rgba(82,183,136,0.2)',  text: '#52b788' },
  failed:    { bg: 'rgba(229,62,62,0.1)',   border: 'rgba(229,62,62,0.2)',   text: '#e53e3e' },
};

function StatusPill({ status }) {
  const c = statusColors[status] ?? statusColors.pending;
  return (
    <span
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: '999px',
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
      }}
    >
      {status ?? 'unknown'}
    </span>
  );
}

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

export default function Dashboard() {
  const { projects, fetchProjects, isLoading: pLoading } = useProjects();
  const { deployments, fetchDeployments, isLoading: hLoading } = useHistory();

  useEffect(() => {
    fetchProjects?.();
    fetchDeployments?.();
  }, []);

  const loading = pLoading || hLoading;
  const recent  = (deployments ?? []).slice(0, 6);
  const stats   = statCards(projects, deployments);

  return (
    <div
      style={{ opacity: 1, animation: 'fadeIn 0.3s ease-out' }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{ color: '#f2f2f2', fontWeight: 700, fontSize: '24px', letterSpacing: '-0.02em' }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#5a5a62', fontSize: '14px', marginTop: '4px' }}>
          Overview of your deployments and projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {stats.map(({ label, value, icon, accent }) => (
          <div
            key={label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.2s ease',
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
            <div
              style={{ color: accent, marginBottom: '12px', opacity: 0.9 }}
            >
              {icon}
            </div>
            <div
              style={{ color: '#f2f2f2', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}
            >
              {loading ? '—' : value}
            </div>
            <div
              style={{ color: '#5a5a62', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Deployments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            style={{ color: '#f2f2f2', fontSize: '16px', fontWeight: 600 }}
          >
            Recent Deployments
          </h2>
          <Link
            to="/history"
            style={{ color: '#52b788', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#74c69d'}
            onMouseLeave={e => e.currentTarget.style.color = '#52b788'}
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#5a5a62', fontSize: '14px' }}>
              No deployments yet.{' '}
              <Link
                to="/deploy"
                style={{ color: '#52b788', textDecoration: 'none', fontWeight: 500 }}
              >
                Deploy your first project →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recent.map((d) => (
              <div
                key={d.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 0.15s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      style={{
                        color: '#f2f2f2',
                        fontSize: '13px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {d.repo_url?.replace('https://github.com/', '') ?? 'Unknown repo'}
                    </p>
                    <p style={{ color: '#5a5a62', fontSize: '12px', marginTop: '3px' }}>
                      {timeAgo(d.created_at)}
                    </p>
                  </div>
                  <StatusPill status={d.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
