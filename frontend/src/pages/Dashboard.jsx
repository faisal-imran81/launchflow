import { usePageTitle } from '../hooks/usePageTitle'
import { useHistory } from '../hooks/useHistory'
import SkeletonCard from '../components/SkeletonCard'
import ErrorAlert from '../components/ErrorAlert'
import DeploymentCard from '../components/DeploymentCard'

const statCardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  padding: '20px',
  transition: 'all 0.2s ease',
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { deployments, isLoading, error } = useHistory()

  const stats = {
    total: deployments.length,
    success: deployments.filter((d) => d.status === 'success').length,
    failed: deployments.filter((d) => d.status === 'failed').length,
    running: deployments.filter((d) => d.status === 'running').length,
  }

  const recentDeployments = deployments.slice(0, 5)

  const statCards = [
    { label: 'Total Deployments', value: stats.total, icon: '📦' },
    { label: 'Successful', value: stats.success, icon: '✅' },
    { label: 'Failed', value: stats.failed, icon: '❌' },
    { label: 'Running', value: stats.running, icon: '⏳' },
  ]

  return (
    <div
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="mb-8">
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
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} rows={2} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <span className="text-2xl">{stat.icon}</span>
                <p
                  style={{
                    color: '#f2f2f2',
                    fontSize: '28px',
                    fontWeight: 700,
                    lineHeight: 1,
                    marginTop: '12px',
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ color: '#5a5a62', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 style={{ color: '#f2f2f2', fontSize: '16px', fontWeight: 600 }}>
              Recent Deployments
            </h2>
            {recentDeployments.length === 0 ? (
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '48px 24px',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: '#5a5a62', fontSize: '14px' }}>
                  No deployments yet — go deploy something! 🚀
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDeployments.map((deployment) => (
                  <DeploymentCard
                    key={deployment.id}
                    deployment={deployment}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
