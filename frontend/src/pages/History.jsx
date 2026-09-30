const mockDeployments = [
  {
    id: 1,
    appName: 'my-react-app',
    repoUrl: 'https://github.com/user/my-react-app',
    status: 'success',
    environment: 'Production',
    deployedAt: '2026-09-29 10:30 AM',
    duration: '2m 34s',
    liveUrl: 'https://my-react-app.launchflow.app',
  },
  {
    id: 2,
    appName: 'node-api-server',
    repoUrl: 'https://github.com/user/node-api-server',
    status: 'failed',
    environment: 'Staging',
    deployedAt: '2026-09-28 04:15 PM',
    duration: '1m 12s',
    liveUrl: null,
  },
  {
    id: 3,
    appName: 'portfolio-site',
    repoUrl: 'https://github.com/user/portfolio-site',
    status: 'success',
    environment: 'Production',
    deployedAt: '2026-09-27 09:00 AM',
    duration: '3m 05s',
    liveUrl: 'https://portfolio-site.launchflow.app',
  },
]

const statusConfig = {
  success: { label: 'Success', class: 'bg-green-500/10 text-green-400 border border-green-500/20' },
  failed: { label: 'Failed', class: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  running: { label: 'Running', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
}

export default function History() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deployment History</h1>
          <p className="text-gray-400 text-sm mt-1">All your past and current deployments</p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
          {mockDeployments.length} deployments
        </span>
      </div>

      <div className="space-y-3">
        {mockDeployments.map((deployment) => (
          <div
            key={deployment.id}
            className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-semibold">{deployment.appName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[deployment.status].class}`}>
                    {statusConfig[deployment.status].label}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                    {deployment.environment}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">{deployment.repoUrl}</p>
              </div>

              {deployment.liveUrl && (
                <a
                  href={deployment.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg transition-colors"
                >
                  🌐 Live URL
                </a>
              )}
            </div>

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>🕐</span>
                <span>{deployment.deployedAt}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>⏱️</span>
                <span>{deployment.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
