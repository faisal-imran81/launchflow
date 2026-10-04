import EmptyState from './EmptyState'

export default function RepoList({ repos, onSelect, selectedRepo, searched }) {
  if (!searched) return null

  if (repos.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No repositories found"
        description="Check the username and try again"
      />
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-gray-400 text-sm">Select Repository</label>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          {repos.length} repos found
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-700 divide-y divide-gray-800">
        {repos.map((repo) => (
          <button
            key={repo.id}
            type="button"
            onClick={() => onSelect(repo)}
            className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-800 ${
              selectedRepo?.id === repo.id
                ? 'bg-blue-600/10 border-l-2 border-blue-500'
                : 'bg-gray-900'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {repo.name}
                </p>
                {repo.description && (
                  <p className="text-gray-500 text-xs truncate mt-0.5">
                    {repo.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {repo.language && (
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                    {repo.language}
                  </span>
                )}
                <span className="text-xs text-gray-500">⭐ {repo.stars}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
