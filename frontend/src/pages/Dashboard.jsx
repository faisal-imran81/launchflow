import { useHistory } from '../hooks/useHistory'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'
import StatusBadge from '../components/StatusBadge'

import { usePageTitle } from '../hooks/usePageTitle'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Overview of your deployment activity
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      {isLoading ? (
        <div className="py-20">
          <Spinner text="Loading dashboard..." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-2"
              >
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-white font-semibold">Recent Deployments</h2>
            {recentDeployments.length === 0 ? (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-gray-500 text-sm">No deployments yet — go deploy something! 🚀</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDeployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-white font-medium truncate">
                        {deployment.projects?.name || 'Unnamed App'}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {deployment.projects?.repo_url || '—'}
                      </p>
                    </div>
                    <StatusBadge status={deployment.status} />
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
