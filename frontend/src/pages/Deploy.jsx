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
import ErrorAlert from '../components/ErrorAlert'
import { useDeploymentStatus } from '../hooks/useDeploymentStatus.js'
import DeploymentStatusBadge from '../components/DeploymentStatusBadge.jsx'
import DeploymentTimeline from '../components/DeploymentTimeline.jsx'

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
  padding: '16px',
}

const sectionLabelStyle = {
  color: '#5a5a62',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '14px',
}

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
    <div
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1
          style={{
            color: '#f2f2f2',
            fontWeight: 700,
            fontSize: '24px',
            letterSpacing: '-0.02em',
          }}
        >
          Deploy
        </h1>
        <p style={{ color: '#5a5a62', fontSize: '14px', marginTop: '4px' }}>
          Trigger a new deployment for your app
        </p>
      </div>

      {/* Page-level error state */}
      {repoError && (
        <div
          style={{
            padding: '16px',
            background: 'rgba(229,62,62,0.06)',
            border: '1px solid rgba(229,62,62,0.15)',
            borderRadius: '12px',
            marginBottom: '16px',
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          <ErrorAlert message={repoError} onDismiss={clearRepoError} />
        </div>
      )}

      {deployError && (
        <div
          style={{
            padding: '16px',
            background: 'rgba(229,62,62,0.06)',
            border: '1px solid rgba(229,62,62,0.15)',
            borderRadius: '12px',
            marginBottom: '16px',
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          <ErrorAlert message={deployError} onDismiss={clearDeployError} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT — AI config + deploy form */}
        <div className="flex flex-col gap-5">
          <div style={cardStyle}>
            <div className="flex items-center gap-3" style={{ marginBottom: '14px' }}>
              <div
                style={{
                  background: 'rgba(82,183,136,0.1)',
                  border: '1px solid rgba(82,183,136,0.15)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="#52b788" strokeWidth="1.5"/>
                  <path d="M8 1 L8 3M8 13 L8 15M1 8 L3 8M13 8 L15 8" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                  AI Configuration
                </p>
                <p style={{ color: '#5a5a62', fontSize: '12px' }}>
                  Generate Dockerfile + GitHub Actions workflow
                </p>
              </div>
            </div>

            <AIEngine />
          </div>

          <div style={cardStyle}>
            <div className="flex items-center gap-3" style={{ marginBottom: '14px' }}>
              <div
                style={{
                  background: 'rgba(82,183,136,0.1)',
                  border: '1px solid rgba(82,183,136,0.15)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2 L8 10" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 5 L8 2 L11 5" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12 C3 13.1 3.9 14 5 14 L11 14 C12.1 14 13 13.1 13 12" stroke="#52b788" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                  Deploy
                </p>
                <p style={{ color: '#5a5a62', fontSize: '12px' }}>
                  Select a repository and launch
                </p>
              </div>
            </div>

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
          </div>
        </div>

        {/* RIGHT — Recent deployments */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: '#f2f2f2', fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Recent Deployments
            </h2>
            <span
              style={{
                color: '#5a5a62',
                fontSize: '11px',
                fontWeight: 500,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '2px 10px',
                borderRadius: '999px',
              }}
            >
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
            <div
              className="space-y-3"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
                maxHeight: '320px',
                overflowY: 'auto',
                paddingRight: '2px',
              }}
            >
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
          <h2
            style={{
              color: '#5a5a62',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            Container Logs
          </h2>
          <div
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
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
        </div>
      )}

      {deploymentId && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deployment status badge + stream indicator */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div style={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <h2 style={{ color: '#f2f2f2', fontSize: '14px', fontWeight: 600 }}>
                  Status
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 9px',
                    borderRadius: '999px',
                    color: streamStatus === 'live'
                      ? '#74c69d'
                      : streamStatus === 'reconnecting'
                      ? '#fbbf24'
                      : '#a0a0a8',
                    background: streamStatus === 'live'
                      ? 'rgba(82,183,136,0.1)'
                      : streamStatus === 'reconnecting'
                      ? 'rgba(245,158,11,0.1)'
                      : 'rgba(255,255,255,0.05)',
                    border: streamStatus === 'live'
                      ? '1px solid rgba(82,183,136,0.2)'
                      : streamStatus === 'reconnecting'
                      ? '1px solid rgba(245,158,11,0.2)'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
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
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#a0a0a8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = '#f2f2f2'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = '#a0a0a8'
                  }}
                >
                  Refresh Status
                </button>
              )}
            </div>
          </div>

          {/* Deployment pipeline timeline */}
          <div className="lg:col-span-2">
            <div style={cardStyle}>
              <p style={sectionLabelStyle}>Pipeline</p>
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

      <SuccessToast
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />
    </div>
  )
}
