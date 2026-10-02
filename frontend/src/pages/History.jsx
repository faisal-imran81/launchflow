import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'

const mockDeployments = []

export default function History() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deployment History</h1>
          <p className="text-gray-400 text-sm mt-1">All your past and current deployments</p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
          {mockDeployments.length} deployments
        </span>
      </div>

      {mockDeployments.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No deployments yet"
          description="Deploy your first app to see history here"
        />
      ) : (
        <div className="space-y-3">
          {mockDeployments.map((deployment) => (
            <div key={deployment.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold">{deployment.appName}</h3>
                    <StatusBadge status={deployment.status} />
                  </div>
                  <p className="text-gray-500 text-xs">{deployment.repoUrl}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
