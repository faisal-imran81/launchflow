import { useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useHistory } from '../hooks/useHistory'
import DeploymentCard from '../components/DeploymentCard'
import SkeletonCard from '../components/SkeletonCard'
import ErrorAlert from '../components/ErrorAlert'
import EmptyState from '../components/EmptyState'
import SuccessToast from '../components/SuccessToast'

export default function History() {
  usePageTitle('History')
  const { deployments, fetchDeployments, removeDeployment, isLoading, error } = useHistory()
  const [toastMessage, setToastMessage] = useState('')

  const handleDelete = async (id) => {
    await removeDeployment(id)
    setToastMessage('🗑 Deployment deleted successfully')
  }

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ color: '#f2f2f2', fontWeight: 700, fontSize: '24px', letterSpacing: '-0.02em' }}
          >
            Deployment History
          </h1>
          <p
            className="text-gray-400 text-sm mt-1"
            style={{ color: '#5a5a62', fontSize: '14px', marginTop: '4px' }}
          >
            All your past and current deployments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full whitespace-nowrap">
            {isLoading
              ? '...'
              : `${deployments.length} ${deployments.length === 1 ? 'deployment' : 'deployments'}`}
          </span>
          <button
            onClick={fetchDeployments}
            disabled={isLoading}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:text-blue-800 bg-gray-800 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} rows={3} />
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No deployments yet"
          description="Deploy your first app to see history here"
        />
      ) : (
        <div
          className="space-y-3"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          {deployments.map((deployment) => (
            <DeploymentCard
              key={deployment.id}
              deployment={deployment}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <SuccessToast
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />
    </div>
  )
}
