import { useState } from 'react'
import EmptyState from './EmptyState'

export default function RepoList({ repos, onSelect, selectedRepo, searched }) {
  const [filter, setFilter] = useState('')

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

  const filtered = repos.filter((repo) =>
    repo.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-gray-400 text-sm">Select Repository</label>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          {repos.length} repos found
        </span>
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter repositories..."
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No repos match "{filter}"</p>
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-700 divide-y divide-gray-800">
          {filtered.map((repo) => (
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
      )}
    </div>
  )
}
