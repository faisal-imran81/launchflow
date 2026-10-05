const statusConfig = {
  success: {
    label: 'Success',
    class: 'bg-green-500/10 text-green-400 border border-green-500/20',
    icon: '✅'
  },
  failed: {
    label: 'Failed',
    class: 'bg-red-500/10 text-red-400 border border-red-500/20',
    icon: '❌'
  },
  running: {
    label: 'Running',
    class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    icon: '⏳'
  },
  queued: {
    label: 'Queued',
    class: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    icon: '🕐'
  },
  pending: {
    label: 'Pending',
    class: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    icon: '🔄'
  },
  cancelled: {
    label: 'Cancelled',
    class: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    icon: '🚫'
  },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    class: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    icon: '❓'
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.class}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
