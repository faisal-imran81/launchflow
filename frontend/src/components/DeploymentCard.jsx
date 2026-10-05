import { useState } from 'react'
import StatusBadge from './StatusBadge'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DeploymentCard({ deployment, onDelete }) {
  const { projects, status, triggered_at, completed_at, logs } = deployment
  const [confirming, setConfirming] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirming) {
      onDelete(deployment.id)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  const handleCancel = (e) => {
    e.stopPropagation()
    setConfirming(false)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-5 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-white font-semibold truncate">
              {projects?.name || 'Unnamed App'}
            </h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-gray-500 text-xs truncate">
            {projects?.repo_url || '—'}
          </p>
          <p className="text-gray-600 text-xs">
            Environment:{' '}
            <span className="text-gray-400">{projects?.environment || '—'}</span>
          </p>
        </div>

        <div className="text-right shrink-0 space-y-1">
          <p className="text-gray-500 text-xs">Triggered</p>
          <p className="text-gray-400 text-xs">{formatDate(triggered_at)}</p>
          {completed_at && (
            <>
              <p className="text-gray-500 text-xs mt-1">Completed</p>
              <p className="text-gray-400 text-xs">{formatDate(completed_at)}</p>
            </>
          )}
        </div>
      </div>

      {logs && (
        <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2">
          <p className="text-gray-400 text-xs font-mono line-clamp-2">{logs}</p>
        </div>
      )}

      {onDelete && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {confirming ? (
            <>
              <p className="text-red-400 text-xs mr-2">Are you sure?</p>
              <button
                onClick={handleCancel}
                className="text-xs text-gray-400 hover:text-gray-300 bg-gray-800 px-3 py-1 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg transition-colors"
            >
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
