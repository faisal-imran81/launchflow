export default function Dashboard() {
  const stats = [
    { label: 'Total Deployments', value: '0', icon: '🚀' },
    { label: 'Active Services', value: '0', icon: '✅' },
    { label: 'Failed Deployments', value: '0', icon: '❌' },
    { label: 'Avg Deploy Time', value: '—', icon: '⏱️' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome to LaunchFlow — your AI-powered deployment platform</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Deployments</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">🚀</span>
          <p className="text-gray-400 text-sm">No deployments yet</p>
          <p className="text-gray-600 text-xs mt-1">Deploy your first app to get started</p>
        </div>
      </div>
    </div>
  )
}
