import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { useHistory } from '../hooks/useHistory'
import SkeletonCard from '../components/SkeletonCard'
import ErrorAlert from '../components/ErrorAlert'
import DeploymentCard from '../components/DeploymentCard'

const statCardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '14px 16px',
  transition: 'all 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const navigate = useNavigate()
  const { deployments, isLoading, error } = useHistory()

  const stats = {
    total: deployments.length,
    success: deployments.filter((d) => d.status === 'success').length,
    failed: deployments.filter((d) => d.status === 'failed').length,
    queued: deployments.filter((d) => d.status === 'queued').length,
  }

  const recentDeployments = deployments.slice(0, 5)

  const statCards = [
    {
      label: 'Total Deployments',
      value: stats.total,
      accent: '#52b788',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2 L8 10" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5 5 L8 2 L11 5" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12 C3 13.1 3.9 14 5 14 L11 14 C12.1 14 13 13.1 13 12" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Successful',
      value: stats.success,
      accent: '#52b788',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="#52b788" strokeWidth="1.5"/>
          <path d="M5 8 L7 10 L11 6" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Failed',
      value: stats.failed,
      accent: '#e53e3e',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="#e53e3e" strokeWidth="1.5"/>
          <path d="M5.5 5.5 L10.5 10.5 M10.5 5.5 L5.5 10.5" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Queued',
      value: stats.queued,
      accent: '#f59e0b',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="#f59e0b" strokeWidth="1.5"/>
          <path d="M8 5 L8 8.5 L10.5 10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            color: '#f2f2f2',
            fontWeight: 700,
            fontSize: '24px',
            letterSpacing: '-0.02em',
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#5a5a62', fontSize: '14px', marginTop: '4px' }}>
          Overview of your deployment activity
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      {isLoading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={statCardStyle}
                className="space-y-3 animate-pulse"
              >
                <div className="h-8 w-8 bg-gray-700 rounded-full" />
                <div className="h-8 w-16 bg-gray-700 rounded-lg" />
                <div className="h-3 w-24 bg-gray-800 rounded-full" />
              </div>
            ))}
          </div>
          <div
            className="space-y-3"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} rows={2} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            {statCards.map((stat) => (
              <div
                key={stat.label}
                style={statCardStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ color: stat.accent, opacity: 0.9, marginBottom: '4px', display: 'inline-flex' }}>{stat.icon}</span>
                <p
                  style={{
                    color: '#f2f2f2',
                    fontSize: '22px',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ color: '#5a5a62', fontSize: '11px', fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#f2f2f2', fontSize: '16px', fontWeight: 600 }}>
                Recent Deployments
              </h2>
              <a
                href="/history"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#5a5a62',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#52b788'}
                onMouseLeave={e => e.currentTarget.style.color = '#5a5a62'}
              >
                View all
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6 L10 6 M7 3 L10 6 L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            {recentDeployments.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 24px',
                  gap: '12px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  animation: 'fadeIn 0.3s ease-out',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2 L8 10" stroke="#5a5a62" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5 5 L8 2 L11 5" stroke="#5a5a62" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12 C3 13.1 3.9 14 5 14 L11 14 C12.1 14 13 13.1 13 12" stroke="#5a5a62" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                  No deployments yet
                </p>
                <p style={{ color: '#5a5a62', fontSize: '13px', lineHeight: '1.6', maxWidth: '260px' }}>
                  Your recent deployments will appear here once you deploy your first project.
                </p>
                <a
                  href="/deploy"
                  style={{
                    marginTop: '8px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid rgba(82,183,136,0.2)',
                    background: 'rgba(82,183,136,0.08)',
                    color: '#52b788',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    display: 'inline-block',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(82,183,136,0.14)';
                    e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(82,183,136,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)';
                  }}
                >
                  Deploy your first project →
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentDeployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    onClick={() => navigate('/history')}
                    style={{ cursor: 'pointer' }}
                  >
                    <DeploymentCard
                      deployment={deployment}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
