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

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            background: 'rgba(229,62,62,0.06)',
            border: '1px solid rgba(229,62,62,0.15)',
            borderRadius: '12px',
            marginBottom: '16px',
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6.5" stroke="#e53e3e" strokeWidth="1.5"/>
            <path d="M8 5 L8 8.5" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="0.8" fill="#e53e3e"/>
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fc8181', fontSize: '13px', fontWeight: 500 }}>
              Failed to load history
            </p>
            <p style={{ color: '#5a5a62', fontSize: '12px', marginTop: '2px' }}>
              {typeof error === 'string' ? error : 'Please check your connection and try again.'}
            </p>
          </div>
          <button
            onClick={() => fetchDeployments?.()}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid rgba(229,62,62,0.2)',
              background: 'rgba(229,62,62,0.08)',
              color: '#fc8181',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,62,62,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(229,62,62,0.08)'}
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          className="space-y-3"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} rows={3} />
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            gap: '12px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="#5a5a62" strokeWidth="1.5"/>
              <path d="M11 7 L11 11.5 L14 13.5" stroke="#5a5a62" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ color: '#f2f2f2', fontSize: '15px', fontWeight: 600 }}>
            No deployments yet
          </p>
          <p style={{ color: '#5a5a62', fontSize: '13px', lineHeight: '1.6', maxWidth: '280px' }}>
            Your deployment history will appear here once you deploy your first project.
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
