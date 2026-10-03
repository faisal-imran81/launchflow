import { useHistory } from '../hooks/useHistory'
import DeploymentCard from '../components/DeploymentCard'
import Spinner from '../components/Spinner'
import ErrorAlert from '../components/ErrorAlert'
import EmptyState from '../components/EmptyState'

export default function History() {
  const { deployments, fetchDeployments, isLoading, error } = useHistory()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deployment History</h1>
          <p className="text-gray-400 text-sm mt-1">All your past and current deployments</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            {deployments.length} deployments
          </span>
          <button
            onClick={fetchDeployments}
            className="text-xs text-blue-400 hover:text-blue-300 bg-gray-800 px-3 py-1 rounded-full transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} />
      )}

      {isLoading ? (
        <div className="py-20">
          <Spinner text="Fetching deployments..." />
        </div>
      ) : deployments.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No deployments yet"
          description="Deploy your first app to see history here"
        />
      ) : (
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <DeploymentCard
              key={deployment.id}
              deployment={deployment}
            />
          ))}
        </div>
      )}
    </div>
  )
}
