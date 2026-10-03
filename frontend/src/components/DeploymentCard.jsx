import StatusBadge from './StatusBadge'

export default function DeploymentCard({ deployment, onClick }) {
  const { projects, status, triggered_at, completed_at, logs } = deployment

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-5 cursor-pointer transition-all duration-200"
    >
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
            Environment: {' '}
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
    </div>
  )
}
