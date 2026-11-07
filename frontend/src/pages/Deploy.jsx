import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useHistory } from '../hooks/useHistory'
import { useDeploy } from '../hooks/useDeploy'
import { useGitHub } from '../hooks/useGitHub'
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

  const {
    deploy,
    loading: deployLoading,
    error: deployError,
    deploymentId,
    containerId,
    status,
    clearError: clearDeployError,
    reset,
  } = useDeploy()

  const {
    repos,
    loading: repoLoading,
    error: repoError,
    fetchRepos,
    fetchFiles,
    clearError: clearRepoError,
    clearRepos,
  } = useGitHub()

  const {
    status: deploymentStatus,
    history: statusHistory,
    meta: statusMeta,
    streamStatus,
    isTerminal,
    reconnect: reconnectStatus,
  } = useDeploymentStatus(deploymentId, { interval: 2000, autoStart: !!deploymentId })

  const getStatusLabel = (status) => {
    const labels = {
      pending:   'Preparing deployment...',
      queued:    'Preparing deployment...',
      cloning:   'Cloning repository...',
      building:  'Building Docker image...',
      pushing:   'Pushing to ECR...',
      deploying: 'Deploying to EC2...',
      running:   'Deployment live!',
      failed:    'Deployment failed.',
      stopped:   'Deployment stopped.',
    };
    return labels[status] ?? 'Processing...';
  };

  const activeStatus = deploymentStatus ?? status
  const logContainerId = containerId ?? statusMeta?.containerId ?? null

  const handleSuccess = async (result) => {
    const newProject = result?.data?.project
    if (newProject) {
      setToastMessage(`🚀 ${newProject.name} deployed successfully!`)
      await fetchDeployments()
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
        <DeployForm
          onSuccess={handleSuccess}
          repos={repos}
          repoLoading={repoLoading}
          repoError={repoError}
          fetchRepos={fetchRepos}
          fetchFiles={fetchFiles}
          clearRepoError={clearRepoError}
          clearRepos={clearRepos}
          deploy={deploy}
          deployLoading={deployLoading}
          deployError={deployError}
          clearDeployError={clearDeployError}
          status={activeStatus}
          getStatusLabel={getStatusLabel}
          reset={reset}
          deploymentId={deploymentId}
          containerId={containerId}
        />

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
      {logContainerId && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-2">
            Container Logs
          </h2>
          <LogStreamErrorBoundary>
            <LogStreamPanel
              containerId={logContainerId}
              poll={false}
              tail={50}
              interval={2000}
              className="w-full"
            />
          </LogStreamErrorBoundary>
        </div>
      )}

      {deploymentId && (
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
