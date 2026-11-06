import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useHistory } from '../hooks/useHistory'
import DeployForm from '../components/DeployForm'
import DeploymentCard from '../components/DeploymentCard'
import SkeletonCard from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import SuccessToast from '../components/SuccessToast'
import AIEngine from '../components/AIEngine'
import LogStreamPanel from '../components/LogStreamPanel.jsx'
import LogStreamErrorBoundary from '../components/LogStreamErrorBoundary.jsx'
import { useDeploymentStatus } from '../hooks/useDeploymentStatus.js'
import DeploymentStatusBadge from '../components/DeploymentStatusBadge.jsx'
import DeploymentTimeline from '../components/DeploymentTimeline.jsx'

export default function Deploy() {
  usePageTitle('Deploy')
  const { deployments, fetchDeployments, isLoading } = useHistory()
  const [toastMessage, setToastMessage] = useState('')
  const [activeContainerId, setActiveContainerId] = useState(null)

  const {
    status: deploymentStatus,
    history: statusHistory,
    meta: statusMeta,
    streamStatus,
    isTerminal,
    reconnect: reconnectStatus,
  } = useDeploymentStatus(activeContainerId, { interval: 2000, autoStart: !!activeContainerId })

  const handleSuccess = async (result) => {
    const newProject = result.data?.project
    if (newProject) {
      setToastMessage(`🚀 ${newProject.name} deployed successfully!`)
      await fetchDeployments()
    }

    // result.containerId comes from the backend deploy response
    if (result?.containerId) {
      setActiveContainerId(result.containerId)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Deploy</h1>
        <p className="text-gray-400 text-sm mt-1">
          Trigger a new deployment for your app
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeployForm onSuccess={handleSuccess} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Recent Deployments</h2>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
              {isLoading ? '...' : `${deployments.length} total`}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} rows={2} />
              ))}
            </div>
          ) : deployments.length === 0 ? (
            <EmptyState
              icon="🚀"
              title="No deployments yet"
              description="Fill the form and hit Deploy Now to get started"
            />
          ) : (
            <div className="space-y-3">
              {deployments.slice(0, 5).map((deployment) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Real-time log stream ── */}
      {activeContainerId && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-2">
            Container Logs
          </h2>
          <LogStreamErrorBoundary>
            <LogStreamPanel
              containerId={activeContainerId}
              poll={false}
              tail={50}
              interval={2000}
              className="w-full"
            />
          </LogStreamErrorBoundary>
        </div>
      )}

      {activeContainerId && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Deployment status badge + stream indicator */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-200">
                  Status
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  streamStatus === 'live'
                    ? 'bg-green-900 text-green-300'
                    : streamStatus === 'reconnecting'
                    ? 'bg-orange-900 text-orange-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {streamStatus === 'live' ? '● Live' : streamStatus === 'reconnecting' ? 'Reconnecting…' : streamStatus}
                </span>
              </div>
              <DeploymentStatusBadge
                status={deploymentStatus}
                size="lg"
                className="w-full justify-center"
              />
              {isTerminal && (
                <button
                  onClick={reconnectStatus}
                  className="mt-3 w-full px-3 py-1.5 text-xs rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
                >
                  Refresh Status
                </button>
              )}
            </div>
          </div>

          {/* Deployment pipeline timeline */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4">
              <LogStreamErrorBoundary>
                <DeploymentTimeline
                  status={deploymentStatus}
                  history={statusHistory}
                  meta={statusMeta}
                />
              </LogStreamErrorBoundary>
            </div>
          </div>

        </div>
      )}

      <AIEngine />

      <SuccessToast
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />
    </div>
  )
}
